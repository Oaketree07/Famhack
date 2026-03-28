'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const isOrganiser = (session.user as any)?.role === 'organiser'

  return (
    <nav className="bg-indigo-900/80 backdrop-blur-md border-b border-indigo-700/50 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="text-white font-bold text-lg flex items-center gap-2">
          💻 <span>CompSoc</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/" className={`px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors ${pathname === '/' ? 'bg-indigo-700/50 text-white' : ''}`}>
            Home
          </Link>
          <Link href="/events" className={`px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors ${pathname.startsWith('/events') ? 'bg-indigo-700/50 text-white' : ''}`}>
            Events
          </Link>
          <Link href="/leaderboard" className={`px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors ${pathname.startsWith('/leaderboard') ? 'bg-indigo-700/50 text-white' : ''}`}>
            Leaderboard
          </Link>
          <Link href="/sig-finder" className={`px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors ${pathname.startsWith('/sig-finder') ? 'bg-indigo-700/50 text-white' : ''}`}>
            SIG Finder
          </Link>
          {isOrganiser && (
            <Link href="/dashboard" className={`px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors ${pathname.startsWith('/dashboard') ? 'bg-indigo-700/50 text-white' : ''}`}>
              Dashboard
            </Link>
          )}
          {isOrganiser && (
            <Link href="/beacon" className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${pathname.startsWith('/beacon') ? 'bg-red-600/70 text-white' : 'text-red-300 hover:text-white hover:bg-red-700/50'}`}>
              📡 Beacon
            </Link>
          )}
          <Link href="/profile" className={`px-3 py-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-700/50 transition-colors ${pathname.startsWith('/profile') ? 'bg-indigo-700/50 text-white' : ''}`}>
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3 py-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-red-700/50 transition-colors ml-1"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
