'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaders, setLeaders] = useState<any[]>([])
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
    const url = selectedSig ? `/api/leaderboard?sig=${selectedSig}` : '/api/leaderboard'
    fetch(url).then(r => r.json()).then(setLeaders)
  }, [selectedSig])

  const badgeEmoji = (level: string) => ({ gold: '🥇', silver: '🥈', bronze: '🥉', none: '⭐' }[level] || '⭐')
  const myId = (session?.user as any)?.id

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">🏆 Leaderboard</h1>

        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setSelectedSig('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedSig ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-300 hover:bg-white/15'}`}>
            Overall
          </button>
          {sigs.map(sig => (
            <button key={sig.id} onClick={() => setSelectedSig(sig.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedSig === sig.slug ? 'bg-indigo-500 text-white' : 'bg-white/10 text-indigo-300 hover:bg-white/15'}`}>
              {sig.name}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {leaders.map((user, i) => (
            <div key={user.id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${user.id === myId ? 'bg-indigo-500/20 border-indigo-500/40' : 'bg-white/10 border-white/10'}`}>
              <div className="text-2xl font-bold text-indigo-400 w-8 text-center">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="flex-1">
                <div className="text-white font-semibold">{user.name} {user.id === myId && <span className="text-xs text-indigo-400">(you)</span>}</div>
                <div className="text-xs text-indigo-400">{user.eventCount} event{user.eventCount !== 1 ? 's' : ''} attended</div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold">{user.totalPoints} pts</div>
                <div className="text-sm">{badgeEmoji(user.badge?.level)}</div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && <div className="text-center py-12 text-indigo-400">No data yet — attend events to appear here!</div>}
        </div>
      </div>
    </div>
  )
}
