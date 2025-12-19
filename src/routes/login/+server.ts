// src/routes/login/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib';
import { randomUUID } from 'crypto';
import type { RequestHandler } from './$types';
import * as crypto from 'node:crypto';
import { validatePassword, hashPassword, dummyHash } from '$lib/auth';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.formData();
	const username = String(data.get('username') ?? '').trim();
	const password = String(data.get('password') ?? '').trim();

	if (!username || !password) {
		return json({ error: 'username and password required' }, { status: 400 });
	}

	try {
		const user = await prisma.user.findUnique({ where: { username } });

		if (!user) {
			// Protect timing by doing a dummy KDF
			dummyHash();
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// If user has migrated passwordHash/salt
		if (user.passwordHash && user.passwordSalt) {
			const ok = validatePassword(password, user.passwordSalt, user.passwordHash);
			if (!ok) {
				return json({ error: 'Invalid credentials' }, { status: 401 });
			}
		} else if (user.password) {
			// Legacy: cleartext password stored — compare safely and migrate on success
			const stored = Buffer.from(user.password, 'utf8');
			const input = Buffer.from(password, 'utf8');
			let legacyMatch = false;
			if (stored.length === input.length) {
				legacyMatch = crypto.timingSafeEqual(stored, input);
			}
			if (!legacyMatch) {
				return json({ error: 'Invalid credentials' }, { status: 401 });
			}

			// Migrate to hashed password
			const { salt, hash, algo } = hashPassword(password);
			await prisma.user.update({
				where: { id: user.id },
				data: { passwordHash: hash, passwordSalt: salt, passwordAlgo: algo, password: null }
			});
		} else {
			// No usable auth data
			dummyHash();
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		// Authentication successful — create session
		const sessionId = randomUUID();
		await prisma.session.create({
			data: {
				sessionId,
				user: { connect: { id: user.id } }
			}
		});

		return json({ user: { id: user.id, username: user.username, email: user.email }, sessionId });
	} catch (err) {
		console.error('Login error:', err);
		return json({ error: 'Login failed' }, { status: 500 });
	}
};
