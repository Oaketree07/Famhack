'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function SigPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [events, setEvents] = useState<any[]>([])
  const [sig, setSig] = useState<any>(null)

  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && slug) {
      fetch(`/api/sigs`).then(r => r.json()).then((sigs: any[]) => {
        const found = sigs.find(s => s.slug === slug)
        setSig(found)
      })
      fetch(`/api/events?sig=${slug}`).then(r => r.json()).then(setEvents)
    }
  }, [status, slug])

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {sig && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: sig.color }} />
              <h1 className="text-2xl font-bold text-white">{sig.name}</h1>
            </div>
            <p className="text-indigo-300">{sig.description}</p>
          </div>
        )}

        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{event.title}</h3>
                  {event.description && <p className="text-indigo-300 text-sm mt-1">{event.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-indigo-400">
                    <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    <span>👥 {event._count?.attendances} attended</span>
                    <span>💬 {event._count?.feedbacks} feedback</span>
                    {event.location && <span>📍 {event.location}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href="/attend" className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
                    Enter Code
                  </Link>
                  <Link href={`/feedback/${event.id}`} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-indigo-300 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-center">
                    Feedback
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <div className="text-center py-12 text-indigo-400">No events yet</div>}
        </div>
      </div>
    </div>
  )
}
