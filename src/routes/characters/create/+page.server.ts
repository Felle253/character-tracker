// src/routes/characters/create/+page.server.ts
import type { Actions } from './$types';
import { prisma } from '$lib';
import { fail, redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/auth';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = (data.get('name') ?? '').toString().trim();
    const description = (data.get('description') ?? '').toString().trim();
    const sessionId = (data.get('sessionId') ?? '').toString().trim();

    if (!sessionId) return fail(401, { error: 'Not authenticated' });
    if (!name) return fail(400, { error: 'Name required' });

    const session = await validateSession(sessionId);
    if (!session || !session.user) return fail(401, { error: 'Invalid session' });

    try {
      await prisma.character.create({
        data: {
          name,
          description: description || null,
          owner: { connect: { id: session.user.id } }
        }
      });

      throw redirect(303, '/characters');
    } catch (err: unknown) {
      console.error('Failed to create character:', err);
      return fail(500, { error: 'Could not create character.' });
    }
  }
};
