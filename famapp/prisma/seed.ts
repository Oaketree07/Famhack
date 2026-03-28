import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Create SIGs
  const sigs = [
    { name: 'CCSIG', slug: 'ccsig', description: 'Competitive Programming', color: '#6366f1' },
    { name: 'GameDevSIG', slug: 'gamedevsig', description: 'Game Development', color: '#10b981' },
    { name: 'Edinburgh AI', slug: 'edinburgh-ai', description: 'Artificial Intelligence', color: '#f59e0b' },
    { name: 'SiGINT', slug: 'sigint', description: 'Cyber Security', color: '#ef4444' },
    { name: 'QuantSIG', slug: 'quantsig', description: 'Quantitative Finance', color: '#8b5cf6' },
    { name: 'CloudSIG', slug: 'cloudsig', description: 'Cloud Computing (AWS)', color: '#06b6d4' },
    { name: 'BitSIG', slug: 'bitsig', description: 'Computer Architecture & Networks', color: '#84cc16' },
    { name: 'TypeSIG', slug: 'typesig', description: 'Type Theory', color: '#f97316' },
    { name: 'Edinburgh Neurotech', slug: 'neurotech', description: 'Neurotechnology', color: '#ec4899' },
    { name: 'Tardis', slug: 'tardis', description: 'Hosting Servers', color: '#14b8a6' },
    { name: 'Edinburgh Venture Point', slug: 'venture-point', description: 'Entrepreneurship', color: '#a855f7' },
    { name: 'Project Share', slug: 'project-share', description: 'Project Collaboration', color: '#64748b' },
  ]

  for (const sig of sigs) {
    await prisma.sIG.upsert({
      where: { slug: sig.slug },
      update: {},
      create: sig,
    })
  }

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const memberPassword = await bcrypt.hash('member123', 10)

  const organiser = await prisma.user.upsert({
    where: { email: 'organiser@comp-soc.com' },
    update: {},
    create: {
      name: 'Alex Organiser',
      email: 'organiser@comp-soc.com',
      password: adminPassword,
      role: 'organiser',
    },
  })

  await prisma.user.upsert({
    where: { email: 'member@ed.ac.uk' },
    update: {},
    create: {
      name: 'Jamie Member',
      email: 'member@ed.ac.uk',
      password: memberPassword,
      role: 'member',
    },
  })

  // Link organiser to CCSIG and Edinburgh AI
  const ccsig = await prisma.sIG.findUnique({ where: { slug: 'ccsig' } })
  const ai = await prisma.sIG.findUnique({ where: { slug: 'edinburgh-ai' } })

  if (ccsig) {
    await prisma.sigOrganiser.upsert({
      where: { userId_sigId: { userId: organiser.id, sigId: ccsig.id } },
      update: {},
      create: { userId: organiser.id, sigId: ccsig.id },
    })
  }
  if (ai) {
    await prisma.sigOrganiser.upsert({
      where: { userId_sigId: { userId: organiser.id, sigId: ai.id } },
      update: {},
      create: { userId: organiser.id, sigId: ai.id },
    })
  }

  // Create sample events
  const events = [
    { title: 'Weekly Contest #42', sigSlug: 'ccsig', code: 'CCSIG-42', daysFromNow: 0, description: 'Codeforces round practice session' },
    { title: 'Unity Workshop', sigSlug: 'gamedevsig', code: 'GAME-07', daysFromNow: 1, description: 'Building your first 3D game in Unity' },
    { title: 'LLM Fine-tuning Workshop', sigSlug: 'edinburgh-ai', code: 'AI-15', daysFromNow: -1, description: 'Fine-tune a small LLM on custom data' },
    { title: 'CTF Practice', sigSlug: 'sigint', code: 'SIGINT-03', daysFromNow: 2, description: 'Practice CTF challenges' },
    { title: 'Quant Trading Basics', sigSlug: 'quantsig', code: 'QUANT-09', daysFromNow: 3, description: 'Introduction to algorithmic trading' },
    { title: 'AWS Lambda Deep Dive', sigSlug: 'cloudsig', code: 'CLOUD-11', daysFromNow: -2, description: 'Serverless computing workshop' },
  ]

  for (const e of events) {
    const sig = await prisma.sIG.findUnique({ where: { slug: e.sigSlug } })
    if (!sig) continue
    const date = new Date()
    date.setDate(date.getDate() + e.daysFromNow)
    await prisma.event.upsert({
      where: { code: e.code },
      update: {},
      create: {
        title: e.title,
        description: e.description,
        sigId: sig.id,
        date,
        code: e.code,
        location: 'Informatics Forum, Room G.03',
      },
    })
  }

  console.log('Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
