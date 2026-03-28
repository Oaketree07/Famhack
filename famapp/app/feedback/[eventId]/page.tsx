'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function FeedbackPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [eventId, setEventId] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [keepDoing, setKeepDoing] = useState('')
  const [improve, setImprove] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(p => setEventId(p.eventId))
  }, [params])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (eventId) fetch(`/api/events/${eventId}`).then(r => r.json()).then(setEvent)
  }, [eventId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) { setError('Please select a rating'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, rating, keepDoing, improve }),
    })
    const data = await res.json()

    if (res.ok) {
      setSubmitted(true)
    } else {
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  const ratingEmojis = ['', '😞', '😕', '😐', '😊', '😀']
  const ratingLabels = ['', 'Poor', 'Below avg', 'Okay', 'Good', 'Excellent']

  if (status === 'loading' || !event) return null

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-2">Thanks for the feedback!</h1>
            <p className="text-indigo-300 mb-2">+1 point awarded</p>
            <p className="text-indigo-400 text-sm mb-6">Your response helps make CompSoc events better</p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-4">
          <div className="text-xs text-indigo-400 mb-1">{event.sig?.name}</div>
          <h1 className="text-xl font-bold text-white">{event.title}</h1>
          <p className="text-indigo-300 text-sm mt-1">{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-white font-semibold mb-4">How was the event?</h2>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5].map(r => (
                <button key={r} type="button" onClick={() => setRating(r)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${rating === r ? 'bg-indigo-500 scale-110' : 'bg-white/10 hover:bg-white/15'}`}>
                  <span className="text-2xl">{ratingEmojis[r]}</span>
                  <span className="text-xs text-indigo-300 mt-1">{ratingLabels[r]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text feedback */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">What should we keep doing? <span className="text-indigo-400 font-normal text-sm">(optional)</span></label>
              <textarea
                value={keepDoing}
                onChange={e => setKeepDoing(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="The hands-on exercises were great..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">What should we improve? <span className="text-indigo-400 font-normal text-sm">(optional)</span></label>
              <textarea
                value={improve}
                onChange={e => setImprove(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                placeholder="Could use more time for Q&A..."
                rows={3}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || !rating}
            className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg"
          >
            {loading ? 'Submitting...' : 'Submit Feedback →'}
          </button>
        </form>
      </div>
    </div>
  )
}
