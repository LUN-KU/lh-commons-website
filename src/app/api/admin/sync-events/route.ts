import { NextRequest, NextResponse } from 'next/server'
import { syncEventsToBrandPL } from '@/lib/adminData'
import { isAdminCookie } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  if (!isAdminCookie(req.cookies.get('lh_admin')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await syncEventsToBrandPL()
  return NextResponse.json(result)
}
