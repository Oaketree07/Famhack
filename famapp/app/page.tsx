'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

interface SIG {
  id: string
  name: string
  slug: string
  description: string
  color: string
  _count: { events: number }
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sigs, setSigs] = useState<SIG[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/sigs').then(r => r.json()).then(setSigs)
      fetch('/api/me').then(r => r.json()).then(setProfile)
    }
  }, [status])

  if (status === 'loading') return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {session.user?.name} 👋</h1>
              <p className="text-indigo-300 mt-1">Compsoc</p>
            </div>
            {profile && (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-300">{profile.totalPoints}</div>
                  <div className="text-xs text-indigo-400">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl">{profile.badge?.level === 'gold' ? '🥇' : profile.badge?.level === 'silver' ? '🥈' : profile.badge?.level === 'bronze' ? '🥉' : '⭐'}</div>
                  <div className="text-xs text-indigo-400 capitalize">{profile.badge?.level || 'No badge'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Link href="/attend" className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl p-4 text-center transition-colors">
            <div className="text-2xl mb-1">📍</div>
            <div className="font-semibold text-sm">Enter Event Code</div>
          </Link>
          <Link href="/events" className="bg-purple-500 hover:bg-purple-400 text-white rounded-xl p-4 text-center transition-colors">
            <div className="text-2xl mb-1">📅</div>
            <div className="font-semibold text-sm">Browse Events</div>
          </Link>
          <Link href="/leaderboard" className="bg-pink-500 hover:bg-pink-400 text-white rounded-xl p-4 text-center transition-colors">
            <div className="text-2xl mb-1">🏆</div>
            <div className="font-semibold text-sm">Leaderboard</div>
          </Link>
          <Link href="/profile" className="bg-violet-500 hover:bg-violet-400 text-white rounded-xl p-4 text-center transition-colors">
            <div className="text-2xl mb-1">👤</div>
            <div className="font-semibold text-sm">My Profile</div>
          </Link>
          <Link href="/sig-finder" className="bg-red-500 hover:bg-red-400 text-white rounded-xl p-4 text-center transition-colors">
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-semibold text-sm">SIG Finder</div>
          </Link>
        </div>

        {/* SIGs */}
        <h2 className="text-xl font-bold text-white mb-4">Special Interest Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sigs.map(sig => (
            <Link key={sig.id} href={`/sigs/${sig.slug}`}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/10 transition-all hover:scale-105 hover:border-white/20 group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sig.color }} />
                <span className="text-xs text-indigo-400">{sig._count.events} events</span>
              </div>
              <h3 className="text-white font-bold text-lg">{sig.name}</h3>
              <p className="text-indigo-300 text-sm mt-1">{sig.description}</p>
              <div className="mt-3 text-xs text-indigo-400 group-hover:text-indigo-300 transition-colors">View events →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
