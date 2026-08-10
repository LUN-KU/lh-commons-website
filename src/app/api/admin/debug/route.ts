import { NextRequest, NextResponse } from 'next/server'
import { getCostRecords } from '@/lib/adminData'
import { isAdminCookie } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!isAdminCookie(req.cookies.get('lh_admin')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const costRecords = await getCostRecords()
  return NextResponse.json({
    total: costRecords.length,
    records: costRecords.map(c => ({
      name: c.name,
      category: c.category,
      date: c.eventDate,
      targetCount: c.targetCount,
      revenue: c.totalRevenue,
    })),
  })
}
