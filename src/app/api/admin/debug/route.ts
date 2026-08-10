import { NextResponse } from 'next/server'
import { getCostRecords, getEventsWithMap } from '@/lib/adminData'

export async function GET() {
  const [costRecords, { events }] = await Promise.all([getCostRecords(), getEventsWithMap()])

  const augEvents = events.filter(e => e.date.startsWith('2026-08'))
  const augCosts = costRecords.filter(c => c.eventDate?.startsWith('2026-08'))

  return NextResponse.json({
    augEvents: augEvents.map(e => ({ id: e.id, name: e.name, date: e.date })),
    augCosts: augCosts.map(c => ({
      name: c.name, date: c.eventDate, eventId: c.eventId,
      targetCount: c.targetCount, cost: c.totalCost, revenue: c.totalRevenue,
    })),
  })
}
