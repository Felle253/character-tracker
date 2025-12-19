// src/routes/register/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib';
import { randomUUID } from 'crypto';
import type { RequestHandler } from './$types';
import { hashPassword } from '$lib/auth';

// Password strength validator
function validatePasswordStrength(password: string): string[] {
	const errors: string[] = [];
	if (password.length < 8) errors.push('Lösenordet måste vara minst 8 tecken');
	if (!/[A-Z]/.test(password)) errors.push('Minst en versal');
	if (!/[a-z]/.test(password)) errors.push('Minst en gemen');
	if (!/[0-9]/.test(password)) errors.push('Minst en siffra');
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Minst ett specialtecken');
	const common = ['password', '123456', 'qwerty', 'abc123', 'password123'];
	if (common.includes(password.toLowerCase())) errors.push('För vanligt lösenord');
	return errors;
}

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.formData();
	const username = String(data.get('username') ?? '').trim();
	const password = String(data.get('password') ?? '').trim();
	const emailRaw = String(data.get('email') ?? '').trim();
	const email = emailRaw === '' ? null : emailRaw.toLowerCase();

	// optional image file
	const file = data.get('image') as unknown as Blob | null;

	if (!username || !password) {
		return json({ error: 'username and password required' }, { status: 400 });
	}

	// Validate password strength
	const pwErrors = validatePasswordStrength(password);
	if (pwErrors.length > 0) {
		return json({ error: pwErrors.join('. ') }, { status: 400 });
	}

	// validate image if present
	let profileImage: string | null = null;
	if (file && (file as any).size) {
		const size = Number((file as any).size || 0);
		const type = String((file as any).type || '');
		const allowed = ['image/jpeg', 'image/png', 'image/webp'];
		const maxSize = 10 * 1024 * 1024; // 10MB

		if (!allowed.includes(type)) {
			return json({ error: 'Fel filtyp. Tillåtna: jpg, png, webp' }, { status: 400 });
		}
		if (size > maxSize) {
			return json({ error: 'Filen är för stor (max 10MB).' }, { status: 400 });
		}

		try {
			const buffer = Buffer.from(await (file as any).arrayBuffer());
			const b64 = buffer.toString('base64');
			profileImage = `data:${type};base64,${b64}`;
		} catch (e) {
			console.error('Image parse error', e);
			return json({ error: 'Kunde inte läsa bilden' }, { status: 500 });
		}
	}

	try {
		// Hash password here (after validation)
		const { salt, hash, algo } = hashPassword(password);

		const user = await prisma.user.create({
			data: {
				username,
				passwordHash: hash,
				passwordSalt: salt,
				passwordAlgo: algo,
				email,
				profileImage
			}
		});

		// create session
		const sessionId = randomUUID();
		await prisma.session.create({
			data: {
				sessionId,
				user: { connect: { id: user.id } }
			}
		});

		// return user + sessionId to client
		return json({ user: { id: user.id, username: user.username, email: user.email }, sessionId });
	} catch (err: unknown) {
		console.error('Register error:', err);
		return json(
			{ error: 'Could not register (maybe username/email already used).' },
			{ status: 500 }
		);
	}
};
