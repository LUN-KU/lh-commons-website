import { NextRequest, NextResponse } from 'next/server'
import { getCostRecords } from '@/lib/adminData'

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('lh_admin')?.value
  if (!cookie || cookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const costRecords = await getCostRecords()
  return NextResponse.json({
    total: costRecords.length,
    records: costRecords.map(c => ({
      name: c.name,
      category: c.category,
      date: c.eventDate,
      revenue: c.totalRevenue,
    })),
  })
}
