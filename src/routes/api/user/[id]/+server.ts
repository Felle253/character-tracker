// src/routes/api/user/[id]/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) return json({ error: 'Missing id' }, { status: 400 });

	const user = await prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			username: true,
			email: true,
			profileImage: true,
			images: {
				orderBy: { createdAt: 'desc' },
				select: { id: true, imageUrl: true, createdAt: true }
			}
		}
	});

	if (!user) return json({ error: 'Not found' }, { status: 404 });

	return json({ user: { id: user.id, username: user.username, email: user.email, profileImage: user.profileImage }, images: user.images });
};
