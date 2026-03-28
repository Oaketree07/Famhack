import { NextResponse } from 'next/server'
import { lastBeacon } from '@/lib/beaconStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json(lastBeacon ?? null)
}
