import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/auth';
import { prisma } from '$lib';

// Global array för att hålla aktiva streams
// I en riktig app skulle du använda Redis eller liknande
//export const activeStreams: ReadableStreamDefaultController[] = [];
import { activeStreams } from '$lib/chat-state';

export const GET: RequestHandler = async ({ cookies }) => {
  // Din uppgift: Skapa en ReadableStream
  
  const encoder = new TextEncoder();
  let controllerRef: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Vad ska hända när stream startar?
      // Tips: Lägg till controller i activeStreams array
      // Tips: Skicka initial data till ny klient
      controllerRef = controller;
      activeStreams.push(controller);
      const initEvent = encoder.encode('data: {"type":"connected"}\n\n');
      controller.enqueue(initEvent);

      // Hämta initiala meddelanden från DB och skicka till ny klient
      (async () => {
        try {
          const messages = await prisma.message.findMany({
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, username: true, profileImage: true } } }
          });

          const initData = encoder.encode(`data: ${JSON.stringify({ type: 'initial_data', messages })}\n\n`);
          controller.enqueue(initData);
        } catch (err) {
          // Ignorera fel här så stream fortfarande upprättas
        }
      })();
    },
    
    cancel() {
      // Vad ska hända när klient kopplar från?
      // Tips: Ta bort controller från activeStreams
      if (!controllerRef) return;
      const idx = activeStreams.indexOf(controllerRef);
      if (idx !== -1) activeStreams.splice(idx, 1);
      controllerRef = null;
    }
  });
  
  // Returnera stream med rätt headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      // Eventuella CORS headers om nödvändigt
    }
  });
};
/*
export function broadcastToAllClients(data: any) {
  const encoder = new TextEncoder();
  const formattedData = `data: ${JSON.stringify(data)}\n\n`;
 // Din kod: Formatera data som SSE
  
  // Din uppgift: Loopa genom activeStreams och skicka data
  // Tips: Använd controller.enqueue()
  // Tips: Hantera fel om controller är stängd

  const chunk = encoder.encode(formattedData);

  for (let i = activeStreams.length - 1; i >= 0; i--) {
    const controller = activeStreams[i];
    try {
      controller.enqueue(chunk);
    } catch (err) {
      try {
        // @ts-ignore
        controller.close?.();
      } catch {}
      activeStreams.splice(i, 1);
    }
  }
}

// Alternativt: Broadcast till specifika användare
export function broadcastToUser(userId: string, data: any) {
  // Hur skulle du filtrera streams per användare?
  // Tips: Du behöver spara user info tillsammans med controller

  const encoder = new TextEncoder();
  const formattedData = `data: ${JSON.stringify(data)}\n\n`;
  const chunk = encoder.encode(formattedData);

  for (let i = activeStreams.length - 1; i >= 0; i--) {
    const controller = activeStreams[i] as any;
    if (!controller) continue;
    if (controller.userId !== userId) continue;
    try {
      controller.enqueue(chunk);
    } catch (err) {
      activeStreams.splice(i, 1);
    }
  }
}
*/
export const POST: RequestHandler = async ({ request, cookies }) => {
  // Require authenticated user
  const user = await requireAuth(cookies);

  // Parse body
  let body: any = {};
  try {
    body = await request.json();
  } catch (err) {
    // ignore
  }

  const content = (body?.content ?? '').toString().trim();
  if (!content) {
    return new Response(JSON.stringify({ error: 'Message content is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Create message in DB and include author info
  const message = await prisma.message.create({
    data: {
      content,
      author: { connect: { id: user.id } }
    },
    include: { author: { select: { id: true, username: true, profileImage: true } } }
  });

  // Broadcast to all connected SSE clients
  broadcastToAllClients({ type: 'new_message', message });

  return new Response(JSON.stringify({ message }), { status: 201, headers: { 'Content-Type': 'application/json' } });
};