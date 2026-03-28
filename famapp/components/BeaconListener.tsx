'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface BeaconSignal {
  eventId: string
  eventTitle: string
  sigName: string
  sigSlug: string
  code: string
  timestamp: number
}

export default function BeaconListener() {
  const { data: session } = useSession()
  const router = useRouter()
  const [beacon, setBeacon] = useState<BeaconSignal | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const handleBeacon = useCallback((signal: BeaconSignal) => {
    setBeacon(signal)
    setDismissed(false)
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])
  }, [])

  useEffect(() => {
    if (!session) return

    let es: EventSource | null = null
    let retryTimeout: ReturnType<typeof setTimeout>

    function connect() {
      es = new EventSource('/api/beacon/stream')

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'beacon') {
            handleBeacon(data as BeaconSignal)
          }
        } catch {}
      }

      es.onerror = () => {
        es?.close()
        // Reconnect after 3s
        retryTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      es?.close()
      clearTimeout(retryTimeout)
    }
  }, [session, handleBeacon])

  if (!beacon || dismissed) return null

  async function confirmAndFeedback() {
    if (!beacon) return
    // Auto-enter the event code then go to feedback
    try {
      await fetch('/api/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: beacon.code }),
      })
    } catch {}
    setDismissed(true)
    router.push(`/feedback/${beacon.eventId}`)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-lg mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl border border-indigo-400/30 overflow-hidden">
        {/* Animated beacon ring */}
        <div className="relative bg-indigo-900/40 px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-2xl">
                📡
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-indigo-900 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-0.5">
                Beacon Detected
              </p>
              <p className="text-white font-bold text-base leading-tight truncate">
                {beacon.eventTitle}
              </p>
              <p className="text-indigo-200 text-sm mt-0.5">{beacon.sigName}</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-indigo-300 hover:text-white p-1 flex-shrink-0 transition-colors"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={confirmAndFeedback}
              className="flex-1 py-3 bg-white text-indigo-700 font-bold rounded-xl text-sm hover:bg-indigo-50 active:scale-95 transition-all"
            >
              Give Feedback →
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-3 bg-indigo-800/60 text-indigo-200 font-medium rounded-xl text-sm hover:bg-indigo-800 active:scale-95 transition-all"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
