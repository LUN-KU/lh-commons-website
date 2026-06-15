import { NextRequest, NextResponse } from 'next/server'
import { syncEventsToBrandPL } from '@/lib/adminData'

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncEventsToBrandPL()
  return NextResponse.json(result)
}
