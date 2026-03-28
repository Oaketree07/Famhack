import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sigSlug = searchParams.get('sig')

  const where = sigSlug ? { sig: { slug: sigSlug } } : {}

  const events = await prisma.event.findMany({
    where,
    include: {
      sig: true,
      _count: { select: { attendances: true, feedbacks: true } }
    },
    orderBy: { date: 'desc' }
  })
  return NextResponse.json(events)
}
