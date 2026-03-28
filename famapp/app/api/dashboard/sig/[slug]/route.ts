import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/authOptions'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const { searchParams } = new URL(req.url)
  const showAll = searchParams.get('showAll') === 'true'

  const sig = await prisma.sIG.findUnique({
    where: { slug },
    include: {
      events: {
        include: {
          _count: { select: { attendances: true, feedbacks: true } },
          feedbacks: {
            where: showAll ? {} : { isUseful: true },
            include: { user: { select: { name: true } } }
          }
        },
        orderBy: { date: 'desc' }
      },
      points: {
        include: { user: { select: { name: true, id: true } } }
      }
    }
  })

  if (!sig) return NextResponse.json({ error: 'SIG not found' }, { status: 404 })

  // Compute stats per event
  const eventStats = sig.events.map(e => {
    const ratings = e.feedbacks.map(f => f.rating)
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b) / ratings.length : 0
    return {
      id: e.id, title: e.title, date: e.date,
      attendees: e._count.attendances,
      feedbackCount: e._count.feedbacks,
      avgRating: Math.round(avgRating * 10) / 10,
      feedbacks: e.feedbacks,
    }
  })

  // Top members by points in this SIG
  const memberPoints: Record<string, { name: string; points: number }> = {}
  for (const p of sig.points) {
    if (!memberPoints[p.userId]) memberPoints[p.userId] = { name: p.user.name, points: 0 }
    memberPoints[p.userId].points += p.amount
  }
  const topMembers = Object.entries(memberPoints)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)

  return NextResponse.json({
    sig: { id: sig.id, name: sig.name, slug: sig.slug, color: sig.color },
    eventStats,
    topMembers
  })
}
