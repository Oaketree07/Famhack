import { sseClients } from '@/lib/beaconStore'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const clientId = crypto.randomUUID()

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder()

      const send = (data: string) => {
        try {
          controller.enqueue(enc.encode(`data: ${data}\n\n`))
        } catch {
          sseClients.delete(clientId)
        }
      }

      sseClients.set(clientId, send)

      // Send initial connection confirmation
      controller.enqueue(enc.encode(`data: {"type":"connected","clientId":"${clientId}"}\n\n`))

      // Keepalive every 20s to prevent connection drop
      const interval = setInterval(() => {
        try {
          controller.enqueue(enc.encode(': keepalive\n\n'))
        } catch {
          clearInterval(interval)
          sseClients.delete(clientId)
        }
      }, 20000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        sseClients.delete(clientId)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
