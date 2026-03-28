import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { filterFeedbackRuleBased } from '@/lib/aiFilter'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId, rating, keepDoing, improve } = await req.json()
  const userId = (session.user as any).id

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  // Check attendance
  const attended = await prisma.attendance.findUnique({
    where: { userId_eventId: { userId, eventId } }
  })
  if (!attended) return NextResponse.json({ error: 'Must attend event first' }, { status: 400 })

  // Check already submitted
  const existingFeedback = await prisma.feedback.findUnique({
    where: { userId_eventId: { userId, eventId } }
  })
  if (existingFeedback) return NextResponse.json({ error: 'Already submitted feedback' }, { status: 400 })

  // AI filter
  const { isUseful, reason } = filterFeedbackRuleBased(keepDoing || '', improve || '')

  // Save feedback
  const feedback = await prisma.feedback.create({
    data: {
      userId, eventId, sigId: event.sigId,
      rating, keepDoing: keepDoing || '', improve: improve || '',
      isUseful, filterReason: reason
    }
  })

  // Award points (if not already awarded)
  const existingPoints = await prisma.points.findUnique({
    where: { userId_eventId: { userId, eventId } }
  })
  if (!existingPoints) {
    await prisma.points.create({
      data: { userId, eventId, sigId: event.sigId, amount: 1 }
    })
  }

  return NextResponse.json({ success: true, feedback })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId')
  const showAll = searchParams.get('showAll') === 'true'

  const where: any = {}
  if (eventId) where.eventId = eventId
  if (!showAll) where.isUseful = true

  const feedbacks = await prisma.feedback.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(feedbacks)
}
