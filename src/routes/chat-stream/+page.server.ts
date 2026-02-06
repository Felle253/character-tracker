// I din +page.server.ts eller message API

import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib';
import { fail } from '@sveltejs/kit';
import { broadcastToAllClients } from './+server';
import { requireAuth, validateSession } from '$lib/auth';

export const actions: Actions = {
	sendMessage: async ({ request, cookies }) => {
		const data = await request.formData();
		const message = data.get('message')?.toString();

		if (!message) {
			return fail(400, { error: 'Message required' });
		}

		const user = await requireAuth(cookies);

		// Spara meddelandet i databas
		const newMessage = await prisma.message.create({
			data: {
				content: message,
				author: { connect: { id: user.id } },
				createdAt: new Date()
			},
			include: { author: { select: { id: true, username: true, profileImage: true } } }
			//   include: {
			//     user: { select: { username: true } }
			//   }
		});

		console.log('message created');

		// NYTT: Broadcast till alla klienter
		broadcastToAllClients({
			type: 'new_message',
			message: newMessage
		});

		console.log('broadcast');

		return { success: true };
	}
};

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('sessionToken');
	if (!token) return { currentUserId: null };

	const session = await validateSession(token);
	return { currentUserId: session?.user?.id ?? null };
};
