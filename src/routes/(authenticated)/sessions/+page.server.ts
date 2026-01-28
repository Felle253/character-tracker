import { prisma } from '$lib';
import { validateSession } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = async ({ cookies }) => {
  const sessionToken = cookies.get('sessionToken');
  //const currentSession = await validateSession(sessionToken);
  const currentSession = sessionToken ? await validateSession(sessionToken) : null;
  
  if (!currentSession) {
    throw redirect(307, '/login');
  }
  
  const sessions = await prisma.session.findMany({
    where: { userId: currentSession.user.id },
    orderBy: { lastUsed: 'desc' }
  });
  
  return {
    sessions,
    currentSessionId: currentSession.id
  };
};

export const actions: Actions = {
  revokeSession: async ({ request, cookies }) => {
    const data = await request.formData();
    const sessionId = data.get('sessionId')?.toString();
    
    if (sessionId) {
      await prisma.session.delete({ where: { id: sessionId } });
    }
  },
  
  revokeAllSessions: async ({ cookies }) => {
    const sessionToken = cookies.get('sessionToken');
    const currentSession = await validateSession(sessionToken);
    
    if (currentSession) {
      // Ta bort alla andra sessions
      await prisma.session.deleteMany({
        where: { 
          userId: currentSession.user.id,
          id: { not: currentSession.id }
        }
      });
    }
  }
};