'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function AttendPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const res = await fetch('/api/attend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()

    if (res.ok || res.status === 200) {
      setResult(data)
    } else {
      setError(data.error || 'Something went wrong')
    }
    setLoading(false)
  }

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📍</div>
            <h1 className="text-2xl font-bold text-white">Enter Event Code</h1>
            <p className="text-indigo-300 mt-2 text-sm">Enter the code announced by your organiser to confirm attendance and unlock feedback</p>
          </div>

          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-400 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="e.g. CCSIG-42"
                required
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !code}
                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
              >
                {loading ? 'Checking...' : 'Confirm Attendance'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="text-5xl mb-3">{result.error === 'Already attended' ? '✅' : '🎉'}</div>
              <h2 className="text-xl font-bold text-white mb-1">{result.event?.title}</h2>
              <p className="text-indigo-300 text-sm mb-2">{result.event?.sig?.name}</p>
              {result.error === 'Already attended' ? (
                <p className="text-yellow-400 text-sm mb-4">You already attended this event.</p>
              ) : (
                <p className="text-green-400 text-sm mb-4">Attendance confirmed! +1 point earned after feedback.</p>
              )}
              <button
                onClick={() => router.push(`/feedback/${result.event?.id}`)}
                className="w-full py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-colors"
              >
                Give Feedback Now →
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-white/5 rounded-xl">
          <p className="text-xs text-indigo-400 text-center">Try demo codes: CCSIG-42, GAME-07, AI-15, SIGINT-03</p>
        </div>
      </div>
    </div>
  )
}
