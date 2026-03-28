import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sigs = await prisma.sIG.findMany({
    include: {
      _count: { select: { events: true } }
    },
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(sigs)
}
