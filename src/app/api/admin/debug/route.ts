import { NextResponse } from 'next/server'
import { getCostRecords } from '@/lib/adminData'

export async function GET() {
  const costRecords = await getCostRecords()
  return NextResponse.json({
    total: costRecords.length,
    personalService: costRecords
      .filter(c => c.category === '個人服務')
      .map(c => ({ name: c.name, date: c.eventDate, revenue: c.totalRevenue })),
    allDates: costRecords.map(c => c.eventDate).sort(),
  })
}
