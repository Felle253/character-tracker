import { prisma } from '$lib';
import * as crypto from 'node:crypto';
import { redirect } from '@sveltejs/kit';

const ITERATIONS = 310000;
const KEYLEN = 32;
const DIGEST = 'sha256';

export function hashPassword(password: string) {
	const salt = crypto.randomBytes(16).toString('hex');
	const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
	const algo = `pbkdf2-sha256$${ITERATIONS}`;
	return { salt, hash, algo };
}

export function validatePassword(inputPassword: string, salt: string, storedHash: string) {
	const hash = crypto.pbkdf2Sync(inputPassword, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
	const a = Buffer.from(storedHash, 'hex');
	const b = Buffer.from(hash, 'hex');
	if (a.length !== b.length) return false;
	return crypto.timingSafeEqual(a, b);
}

export function dummyHash() {
	crypto.pbkdf2Sync('dummy-password', 'dummy-salt', ITERATIONS, KEYLEN, DIGEST).toString('hex');
}

export function generateSessionToken() {
	return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14); // 14 dagar
  
  const session = await prisma.session.create({
    data: {
      token,
      userId,
      userAgent,
      ipAddress,
      expiresAt
    }
  });
  
  return session;
}

export function isTokenExpired(createdAt: Date, maxAgeInDays: number = 7): boolean {
	const now = new Date();
	const maxAgeInMillis = maxAgeInDays * 24 * 60 * 60 * 1000;
	return now.getTime() - createdAt.getTime() > maxAgeInMillis;
}

export async function requireAuth(cookies: any) {
	const sessionToken = cookies.get('sessionToken');
  
	if (!sessionToken) {
		throw redirect(307, '/login');
	}
  
	/*const user = await prisma.user.findUnique({
		where: { sessionToken }
	});*/

	const session = await prisma.session.findUnique({
		where: { token: sessionToken },
		include: { user: true }
	});

	if (!session || !session.user) {
		cookies.delete('sessionToken', { path: '/' });
		throw redirect(307, '/login');
	}
  
	/*if (!user || !user.tokenCreatedAt) {
		cookies.delete('sessionToken', { path: '/' });
		throw redirect(307, '/login');
	}*/
  
	const expiredDays = 7;
	if (isTokenExpired(session.createdAt, expiredDays)) {
		await prisma.session.delete({
			where: { id: session.id },
			//data: { sessionToken: null, tokenCreatedAt: null }
		});
    
		cookies.delete('sessionToken', { path: '/' });
		throw redirect(307, '/login');
	}
  
	return session.user;
}

export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });
  
  if (!session) {
    return null;
  }
  
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  
  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsed: new Date() }
  });
  
  return session;
}