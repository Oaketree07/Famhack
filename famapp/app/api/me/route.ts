import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { getBadgeLevel } from '@/lib/aiFilter'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      points: { include: { sig: true, event: true } },
      attendances: { include: { event: { include: { sig: true } } } },
      feedbacks: true,
    }
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const totalPoints = user.points.reduce((s, p) => s + p.amount, 0)

  // Points per SIG
  const sigPoints: Record<string, { sigName: string; points: number; eventCount: number }> = {}
  for (const p of user.points) {
    if (!sigPoints[p.sigId]) sigPoints[p.sigId] = { sigName: p.sig.name, points: 0, eventCount: 0 }
    sigPoints[p.sigId].points += p.amount
    sigPoints[p.sigId].eventCount += 1
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    role: user.role,
    totalPoints,
    eventCount: user.points.length,
    badge: getBadgeLevel(user.points.length),
    sigPoints: Object.values(sigPoints),
    recentAttendances: user.attendances.slice(-5),
  })
}
