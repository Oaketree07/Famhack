import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBadgeLevel } from '@/lib/aiFilter'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sigSlug = searchParams.get('sig')

  const sig = sigSlug ? await prisma.sIG.findUnique({ where: { slug: sigSlug } }) : null

  const users = await prisma.user.findMany({
    include: {
      points: sig ? { where: { sigId: sig.id } } : true,
    }
  })

  const ranked = users
    .map(u => ({
      id: u.id,
      name: u.name,
      totalPoints: u.points.reduce((s, p) => s + p.amount, 0),
      eventCount: u.points.length,
      badge: getBadgeLevel(u.points.length),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .filter(u => u.totalPoints > 0)

  return NextResponse.json(ranked)
}
