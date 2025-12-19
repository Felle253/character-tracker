import * as crypto from 'node:crypto';

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
