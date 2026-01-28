// src/routes/characters/+page.server.ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib';
import { error } from '@sveltejs/kit';

export const load = (async () => {
	try {
		// Hämta characters + games + owner
		const charactersRaw = await prisma.character.findMany({
			orderBy: { createdAt: 'desc' },
			include: { games: { orderBy: { createdAt: 'desc' } }, owner: true }
		});

		const list = charactersRaw.map((c) => {
			const total = c.games.length;
			const wins = c.games.filter((g) => g.result === 'WIN').length;
			const losses = total - wins;
			const winRate = total === 0 ? 0 : Math.round((wins / total) * 1000) / 10;
			return {
				id: c.id,
				name: c.name,
				description: c.description,
				createdAt: c.createdAt,
				total,
				wins,
				losses,
				winRate,
				ownerId: c.owner?.id ?? null,
				ownerName: c.owner?.username ?? null
			};
		});

		return { characters: list };
	} catch (err) {
		console.error('Failed to load characters:', err);
		throw error(500, 'Kunde inte hämta characters');
	}
}) satisfies PageServerLoad;
