export const activeStreams: ReadableStreamDefaultController[] = [];

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