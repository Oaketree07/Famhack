import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/authOptions'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  const userId = (session.user as any).id

  const event = await prisma.event.findUnique({
    where: { code: code.toUpperCase().trim() },
    include: { sig: true }
  })
  if (!event) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  // Check already attended
  const existing = await prisma.attendance.findUnique({
    where: { userId_eventId: { userId, eventId: event.id } }
  })
  if (existing) return NextResponse.json({ error: 'Already attended', event }, { status: 200 })

  await prisma.attendance.create({ data: { userId, eventId: event.id } })

  return NextResponse.json({ success: true, event })
}
