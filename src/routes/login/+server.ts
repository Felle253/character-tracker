// src/routes/login/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib';
import type { RequestHandler } from './$types';
import * as crypto from 'node:crypto';
import { validatePassword, hashPassword, dummyHash, generateSessionToken } from '$lib/auth';
//import type { Actions } from './$types';
//import { redirect } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request , cookies }) => {
	const data = await request.formData();
	const username = String(data.get('username') ?? '').trim();
	const password = String(data.get('password') ?? '').trim();

	if (!username || !password) {
		return json({ error: 'username and password required' }, { status: 400 });
	}

	try {
		const user = await prisma.user.findUnique({ where: { username } });

		if (!user) {
			// Protect timing by doing a dummy
			dummyHash();
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		if (user.passwordHash && user.passwordSalt) {
			const ok = validatePassword(password, user.passwordSalt, user.passwordHash);
			if (!ok) {
				return json({ error: 'Invalid credentials' }, { status: 401 });
			}
		} else if (user.password) {
			const stored = Buffer.from(user.password, 'utf8');
			const input = Buffer.from(password, 'utf8');
			let legacyMatch = false;
			if (stored.length === input.length) {
				legacyMatch = crypto.timingSafeEqual(stored, input);
			}
			if (!legacyMatch) {
				return json({ error: 'Invalid credentials' }, { status: 401 });
			}

			const { salt, hash, algo } = hashPassword(password);
			await prisma.user.update({
				where: { id: user.id },
				data: { passwordHash: hash, passwordSalt: salt, passwordAlgo: algo, password: null }
			});
		} else {
			dummyHash();
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		const sessionToken = generateSessionToken();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 14); // 14 = 14 dagar

		await prisma.session.create({
			data: {
				token: sessionToken,
				userId: user.id,
				expiresAt
			}
		});

		await prisma.user.update({
			where: { id: user.id },
			data: { lastActive: new Date() }
		});

		cookies.set('sessionToken', sessionToken, {
			path: '/',
			maxAge: 60 * 60 * 24 * 14, // 14 = 14 dagar
			secure: false,
			httpOnly: true
		});
		//throw redirect(307, '/');
		return json(
			{
				user: { id: user.id, username: user.username, email: user.email ?? null },
				sessionId: sessionToken
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error('Login error:', err);
		return json({ error: 'Login failed' }, { status: 500 });
	}
};
