'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function SigDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [slug, setSlug] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [showAll, setShowAll] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'organiser') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && slug) {
      fetch(`/api/dashboard/sig/${slug}?showAll=${showAll}`).then(r => r.json()).then(setData)
    }
  }, [status, slug, showAll])

  const starRating = (avg: number) => {
    const stars = Math.round(avg)
    return '★'.repeat(stars) + '☆'.repeat(5 - stars)
  }

  if (status === 'loading' || !data) return null

  const totalFeedback = data.eventStats?.reduce((s: number, e: any) => s + e.feedbackCount, 0) || 0
  const totalAttendees = data.eventStats?.reduce((s: number, e: any) => s + e.attendees, 0) || 0
  const ratedEvents = data.eventStats?.filter((e: any) => e.avgRating > 0) || []
  const overallAvg = ratedEvents.length
    ? ratedEvents.reduce((s: number, e: any) => s + e.avgRating, 0) / ratedEvents.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{data.sig?.name} Dashboard</h1>
            <p className="text-indigo-400 text-sm">Event analytics &amp; feedback insights</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-indigo-300">Show filtered feedback</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
              <div className={`w-10 h-6 rounded-full transition-colors ${showAll ? 'bg-indigo-500' : 'bg-white/20'}`} />
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${showAll ? 'translate-x-4' : ''}`} />
            </div>
          </label>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center">
            <div className="text-3xl font-bold text-indigo-300">{totalAttendees}</div>
            <div className="text-xs text-indigo-400 mt-1">Total Attendees</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center">
            <div className="text-3xl font-bold text-indigo-300">{totalFeedback}</div>
            <div className="text-xs text-indigo-400 mt-1">Feedback Responses</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 border border-white/10 text-center">
            <div className="text-2xl font-bold text-yellow-400">{overallAvg > 0 ? overallAvg.toFixed(1) : '—'}</div>
            <div className="text-xs text-indigo-400 mt-1">Avg Rating</div>
          </div>
        </div>

        {/* Top members */}
        {data.topMembers?.length > 0 && (
          <div className="bg-white/10 rounded-xl p-5 border border-white/10 mb-6">
            <h2 className="text-white font-semibold mb-3">Top Engaged Members</h2>
            <div className="space-y-2">
              {data.topMembers.map((m: any, i: number) => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 text-sm w-5 text-right">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <span className="text-white text-sm">{m.name}</span>
                  </div>
                  <span className="text-indigo-300 font-bold text-sm">{m.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        <h2 className="text-white font-semibold mb-3">Events</h2>
        <div className="space-y-4">
          {data.eventStats?.map((event: any) => (
            <div key={event.id} className="bg-white/10 rounded-xl border border-white/10 overflow-hidden">
              <button
                className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(expanded === event.id ? null : event.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium">{event.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-indigo-400">
                      <span>📅 {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      <span>👥 {event.attendees}</span>
                      <span>💬 {event.feedbackCount}</span>
                      {event.avgRating > 0 && (
                        <span className="text-yellow-400">{starRating(event.avgRating)} ({event.avgRating})</span>
                      )}
                    </div>
                  </div>
                  <span className="text-indigo-400">{expanded === event.id ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === event.id && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  {event.feedbacks?.length === 0 ? (
                    <p className="text-indigo-400 text-sm">No feedback yet</p>
                  ) : (
                    event.feedbacks?.map((f: any) => (
                      <div key={f.id} className={`p-3 rounded-lg ${f.isUseful ? 'bg-white/5' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-indigo-400">{f.user?.name}</span>
                          <span className="text-yellow-400 text-xs">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                        </div>
                        {f.keepDoing && <p className="text-green-300 text-sm">✓ {f.keepDoing}</p>}
                        {f.improve && <p className="text-orange-300 text-sm">△ {f.improve}</p>}
                        {!f.isUseful && <p className="text-xs text-red-400 mt-1">Filtered: {f.filterReason}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
