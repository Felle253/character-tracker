// src/routes/register/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib';
import { randomUUID } from 'crypto';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.formData();
  const username = String(data.get('username') ?? '').trim();
  const password = String(data.get('password') ?? '').trim();
  const emailRaw = String(data.get('email') ?? '').trim();
  const email = emailRaw === '' ? null : emailRaw.toLowerCase();

  if (!username || !password) {
    return json({ error: 'username and password required' }, { status: 400 });
  }

  try {
    // create user (username is unique per schema)
    const user = await prisma.user.create({
      data: { username, password, email }
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
    // possible unique constraint violation
    return json({ error: 'Could not register (maybe username/email already used).' }, { status: 500 });
  }
};
