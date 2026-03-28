'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/me').then(r => r.json()).then(setProfile)
    }
  }, [status])

  const badgeColor: Record<string, string> = { gold: 'text-yellow-400', silver: 'text-gray-300', bronze: 'text-orange-400', none: 'text-indigo-400' }
  const badgeEmoji: Record<string, string> = { gold: '🥇', silver: '🥈', bronze: '🥉', none: '⭐' }

  if (status === 'loading' || !profile) return null

  const badge = profile.badge
  const level: string = badge?.level || 'none'

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Profile header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {profile.name?.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="text-indigo-400 text-sm">{profile.email}</p>
              <span className="text-xs px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full capitalize mt-1 inline-block">{profile.role}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
            <div className="text-3xl font-bold text-indigo-300">{profile.totalPoints}</div>
            <div className="text-xs text-indigo-400 mt-1">Total Points</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
            <div className="text-3xl font-bold text-indigo-300">{profile.eventCount}</div>
            <div className="text-xs text-indigo-400 mt-1">Events Attended</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center">
            <div className="text-3xl">{badgeEmoji[level] || '⭐'}</div>
            <div className={`text-xs mt-1 capitalize font-medium ${badgeColor[level] || 'text-indigo-400'}`}>{level} badge</div>
          </div>
        </div>

        {/* Badge progress */}
        {badge?.next > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-indigo-300">Progress to next badge</span>
              <span className="text-white font-medium">{badge.next} more events</span>
            </div>
            <div className="bg-white/10 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(5, 100 - (badge.next / (level === 'none' ? 3 : level === 'bronze' ? 7 : 12)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* SIG breakdown */}
        {profile.sigPoints?.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4">Points by SIG</h2>
            <div className="space-y-3">
              {profile.sigPoints.sort((a: any, b: any) => b.points - a.points).map((sp: any) => (
                <div key={sp.sigName} className="flex items-center justify-between">
                  <div>
                    <span className="text-white text-sm font-medium">{sp.sigName}</span>
                    <span className="text-indigo-400 text-xs ml-2">{sp.eventCount} event{sp.eventCount !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-indigo-300 font-bold">{sp.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
