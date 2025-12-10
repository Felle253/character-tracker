import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = (async ({ params }) => {
  const id = params.id;
  try {
    const character = await prisma.character.findUnique({
      where: { id },
      include: { games: { orderBy: { createdAt: 'desc' } } }
    });

    if (!character) throw error(404, 'Character not found');

    // Hämta andra characters
    const otherCharacters = await prisma.character.findMany({
      where: { id: { not: id } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    });

    // compute stats
    const total = character.games.length;
    const wins = character.games.filter((g) => g.result === 'WIN').length;
    const losses = character.games.filter((g) => g.result === 'LOSS').length;
    const draws = character.games.filter((g) => g.result === 'DRAW').length;
    const winRate = total === 0 ? 0 : Math.round((wins / total) * 1000) / 10; // single decimal

    return { character, total, wins, losses, draws, winRate, otherCharacters };
  } catch (err) {
    console.error('Failed to load character:', err);
    throw error(500, 'Kunde inte läsa character');
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  logMatch: async ({ request, params }) => {
    const data = await request.formData();
    const id = params.id;

    if (!id) return fail(400, { error: 'Missing character id' });

    // optional fields from form
    const opponentId = (data.get('opponentId') ?? '').toString().trim() || null;
    const comment = (data.get('comment') ?? '').toString().trim() || null;
    const durationRaw = (data.get('durationSeconds') ?? '').toString().trim();
    const durationSeconds = durationRaw ? parseInt(durationRaw, 10) : null;

    // Server-side 50/50 result selection (random)
    const isWin = Math.random() < 0.5;
    const playerResult = isWin ? 'WIN' : 'LOSS';
    const opponentResult = isWin ? 'LOSS' : 'WIN';

    try {
      // load player and optional opponent
      const [player, opponent] = await Promise.all([
        prisma.character.findUnique({ where: { id } }),
        opponentId ? prisma.character.findUnique({ where: { id: opponentId } }) : Promise.resolve(null)
      ]);

      if (!player) return fail(404, { error: 'Character not found' });

      if (opponentId && !opponent) {
        return fail(400, { error: 'Vald motståndare finns inte.' });
      }

      if (opponent && opponent.id === player.id) {
        return fail(400, { error: 'Du kan inte välja samma character som motståndare.' });
      }

      // Create games: one for player, and if opponent chosen, one for opponent with inverted result.
      if (opponent) {
        // Use transaction to keep them in sync
        await prisma.$transaction([
          prisma.game.create({
            data: {
              result: playerResult,
              opponentName: opponent.name,
              comment,
              durationSeconds,
              character: { connect: { id: player.id } }
            }
          }),
          prisma.game.create({
            data: {
              result: opponentResult,
              opponentName: player.name,
              comment,
              durationSeconds,
              character: { connect: { id: opponent.id } }
            }
          })
        ]);
      } else {
        // No opponent chosen: create single game for the player (opponentName null)
        await prisma.game.create({
          data: {
            result: playerResult,
            opponentName: null,
            comment,
            durationSeconds,
            character: { connect: { id: player.id } }
          }
        });
      }

      throw redirect(303, `/characters/${id}`);
    } catch (err) {
      console.error('Failed to log match:', err);
      return fail(500, { error: 'Could not log match' });
    }
  }
};
