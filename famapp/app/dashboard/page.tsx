'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sigs, setSigs] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && (session?.user as any)?.role !== 'organiser') router.push('/')
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/sigs').then(r => r.json()).then(setSigs)
    }
  }, [status])

  if (status === 'loading') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Organiser Dashboard</h1>
        <p className="text-indigo-400 mb-6">Select a SIG to view detailed analytics</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sigs.map(sig => (
            <Link key={sig.id} href={`/dashboard/sig/${sig.slug}`}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/10 transition-all hover:scale-105">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sig.color }} />
                <h3 className="text-white font-bold">{sig.name}</h3>
              </div>
              <p className="text-indigo-300 text-sm">{sig.description}</p>
              <div className="mt-3 text-xs text-indigo-400">{sig._count?.events} events →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
