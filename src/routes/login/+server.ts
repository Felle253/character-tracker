// src/routes/login/+server.ts
import { json } from '@sveltejs/kit';
import { prisma } from '$lib';
import { randomUUID } from 'crypto';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.formData();
  const username = String(data.get('username') ?? '').trim();
  const password = String(data.get('password') ?? '').trim();

  if (!username || !password) {
    return json({ error: 'username and password required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== password) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
