// Module-level store — works in single-process Next.js dev mode (fine for demo)

export interface BeaconSignal {
  eventId: string
  eventTitle: string
  sigName: string
  sigSlug: string
  code: string
  timestamp: number
}

// Connected phone clients: id → send function
export const sseClients = new Map<string, (data: string) => void>()

// Last broadcast beacon (cleared after 60s)
export let lastBeacon: BeaconSignal | null = null
export function setLastBeacon(b: BeaconSignal | null) {
  lastBeacon = b
}
