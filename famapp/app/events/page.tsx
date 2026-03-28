'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [sigs, setSigs] = useState<any[]>([])
  const [selectedSig, setSelectedSig] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/sigs').then(r => r.json()).then(setSigs)
    }
  }, [status])

  useEffect(() => {
    const url = selectedSig ? `/api/events?sig=${selectedSig}` : '/api/events'
    fetch(url).then(r => r.json()).then(setEvents)
  }, [selectedSig])

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Events</h1>

        {/* Filter by SIG */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedSig('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedSig ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-300 hover:bg-white/15'}`}
          >All SIGs</button>
          {sigs.map(sig => (
            <button
              key={sig.id}
              onClick={() => setSelectedSig(sig.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSig === sig.slug ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-300 hover:bg-white/15'}`}
            >{sig.name}</button>
          ))}
        </div>

        <div className="space-y-4">
          {events.map(event => {
            const isUpcoming = new Date(event.date) >= new Date()
            return (
              <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: event.sig?.color + '33', color: event.sig?.color }}>
                        {event.sig?.name}
                      </span>
                      {isUpcoming ? (
                        <span className="text-xs text-green-400 font-medium">Upcoming</span>
                      ) : (
                        <span className="text-xs text-indigo-400">Past event</span>
                      )}
                    </div>
                    <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                    {event.description && <p className="text-indigo-300 text-sm mt-1">{event.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-indigo-400">
                      <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>👥 {event._count?.attendances} attended</span>
                      <span>💬 {event._count?.feedbacks} feedback</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href="/attend" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                      Enter Code
                    </Link>
                    <Link href={`/feedback/${event.id}`} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-indigo-300 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-center">
                      Give Feedback
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
          {events.length === 0 && (
            <div className="text-center py-12 text-indigo-400">No events found</div>
          )}
        </div>
      </div>
    </div>
  )
}
