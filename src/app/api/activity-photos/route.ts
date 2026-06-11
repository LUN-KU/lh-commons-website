import { getActivityPhotos } from '@/lib/notion'
import { NextResponse } from 'next/server'

export const revalidate = 0

export async function GET() {
  try {
    const photos = await getActivityPhotos()
    return NextResponse.json({ photos })
  } catch {
    return NextResponse.json({ photos: [] })
  }
}
