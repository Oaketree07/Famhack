'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function BeaconControlPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [firing, setFiring] = useState(false)
  const [result, setResult] = useState<{ notified: number; connectedClients: number } | null>(null)
  const [localIP, setLocalIP] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/events').then(r => r.json()).then(setEvents)
      // Determine local IP from the current URL
      setLocalIP(window.location.host)
    }
  }, [status])

  async function activateBeacon() {
    if (!selected) return
    setFiring(true)
    setResult(null)
    const res = await fetch('/api/beacon/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: selected.id,
        eventTitle: selected.title,
        sigName: selected.sig?.name,
        sigSlug: selected.sig?.slug,
        code: selected.code,
      }),
    })
    const data = await res.json()
    setResult(data)
    setFiring(false)
  }

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">📡</div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Beacon Control Panel</h1>
          <p className="text-indigo-400">Laptop acts as the BLE beacon — activate to push feedback prompt to nearby phones</p>
        </div>

        {/* Phone connection guide */}
        <div className="bg-indigo-900/60 border border-indigo-700/50 rounded-2xl p-5 mb-8">
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">
            <span className="text-green-400">📱</span> Connect your phone
          </h2>
          <p className="text-indigo-300 text-sm mb-3">
            Make sure your phone is on the <strong className="text-white">same WiFi network</strong> as this laptop, then navigate to:
          </p>
          <div className="bg-black/40 rounded-xl px-4 py-3 font-mono text-green-400 text-lg font-bold tracking-wide text-center select-all">
            http://{localIP}
          </div>
          <p className="text-indigo-400 text-xs mt-3 text-center">
            Log in on the phone, then come back here and hit Activate
          </p>
        </div>

        {/* Event selector */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-white font-bold mb-4">1. Select the event</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map(event => (
              <button key={event.id}
                onClick={() => setSelected(event)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${selected?.id === event.id ? 'border-indigo-500 bg-indigo-500/20' : 'border-white/10 bg-white/5 hover:border-white/25'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium">{event.title}</span>
                    <span className="text-indigo-400 text-sm ml-2">{event.sig?.name}</span>
                  </div>
                  <span className="font-mono text-xs text-indigo-400 bg-white/10 px-2 py-1 rounded-lg">{event.code}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Activate button */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-white font-bold mb-4">2. Broadcast the beacon signal</h2>
          {selected ? (
            <div className="bg-indigo-900/40 rounded-xl p-4 mb-4">
              <div className="text-xs text-indigo-400 mb-1">Selected event</div>
              <div className="text-white font-bold">{selected.title}</div>
              <div className="text-indigo-300 text-sm">{selected.sig?.name} · Code: {selected.code}</div>
            </div>
          ) : (
            <p className="text-indigo-400 text-sm mb-4">← Select an event above first</p>
          )}

          <button
            onClick={activateBeacon}
            disabled={!selected || firing}
            className="w-full py-5 rounded-2xl bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-extrabold text-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(239,68,68,0.4)] active:scale-95 flex items-center justify-center gap-3"
          >
            {firing ? (
              <>
                <span className="animate-spin">📡</span> Broadcasting...
              </>
            ) : (
              <>📡 Activate Beacon</>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-green-500/20 border border-green-500/40 rounded-2xl p-5 text-center animate-in fade-in duration-300">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-white font-bold text-lg">Signal sent!</div>
            <div className="text-green-300 text-sm mt-1">
              Notified <strong>{result.notified}</strong> connected device{result.notified !== 1 ? 's' : ''} &nbsp;·&nbsp; {result.connectedClients} listening
            </div>
            <p className="text-indigo-400 text-xs mt-2">
              The feedback banner should now appear on your phone
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
