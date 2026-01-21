// src/routes/profile/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib';
import { fail, redirect } from '@sveltejs/kit';
import { Buffer } from 'buffer';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	upload: async ({ request }) => {
		const form = await request.formData();
		const userId = String(form.get('userId') ?? '');
		const rawFile = form.get('image') as Blob | File | null;

		if (!userId) return fail(400, { error: 'Missing userId' });
		if (!rawFile) return fail(400, { error: 'Ingen fil vald' });

		const size = (rawFile as any).size ?? 0;
		const type = (rawFile as any).type ?? '';

		try {
			const allowed = ['image/jpeg', 'image/png', 'image/webp'];
			const maxSize = 10 * 1024 * 1024; // 10MB

			if (size === 0) return fail(400, { error: 'Tom fil' });
			if (size > maxSize) return fail(400, { error: 'Filen är för stor (max 10MB).' });
			if (!allowed.includes(type)) {
				return fail(400, { error: `Fel filtyp. Tillåtna: ${allowed.join(', ')}` });
			}

			if (typeof (rawFile as any).arrayBuffer !== 'function') {
				console.error('Upload: received file without arrayBuffer()', rawFile);
				return fail(400, { error: 'Ogiltig filtyp från klienten' });
			}

			const arrayBuffer = await (rawFile as any).arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const dataUrl = `data:${type};base64,${buffer.toString('base64')}`;

			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) return fail(404, { error: 'User not found' });

			await prisma.user.update({ where: { id: userId }, data: { profileImage: dataUrl } });

			await prisma.profileImage.create({ data: { userId, imageUrl: dataUrl } });

			throw redirect(303, '/profile');
		} catch (err) {
			console.error('Profile upload error:', err);
			return fail(500, { error: 'Uppladdning misslyckades' });
		}
	},

	remove: async ({ request }) => {
		const form = await request.formData();
		const imageId = String(form.get('imageId') ?? '');
		if (!imageId) return fail(400, { error: 'No imageId provided' });

		try {
			const img = await prisma.profileImage.findUnique({ where: { id: imageId } });
			if (!img) return fail(404, { error: 'Image not found' });

			const user = await prisma.user.findUnique({ where: { id: img.userId } });
			if (user && user.profileImage === img.imageUrl) {
				await prisma.user.update({ where: { id: user.id }, data: { profileImage: null } });
			}

			await prisma.profileImage.delete({ where: { id: imageId } });

			throw redirect(303, '/profile');
		} catch (err) {
			console.error('Profile remove error:', err);
			return fail(500, { error: 'Kunde inte ta bort bilden' });
		}
	}
};
