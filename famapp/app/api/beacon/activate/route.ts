import { NextRequest, NextResponse } from 'next/server'
import { sseClients, setLastBeacon, type BeaconSignal } from '@/lib/beaconStore'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const signal: BeaconSignal = { ...body, timestamp: Date.now() }

  setLastBeacon(signal)

  // Broadcast to all connected phones
  const payload = JSON.stringify({ type: 'beacon', ...signal })
  let notified = 0
  sseClients.forEach(send => {
    try { send(payload); notified++ } catch {}
  })

  // Auto-clear after 60s
  setTimeout(() => setLastBeacon(null), 60_000)

  return NextResponse.json({ success: true, notified, connectedClients: sseClients.size })
}
