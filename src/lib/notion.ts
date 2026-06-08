import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const databaseId = process.env.NOTION_DATABASE_ID!

export type Event = {
  id: string
  name: string
  date: string | null
  time: string
  location: string
  category: string
  fee: string
  registrationUrl: string | null
  status: string
}

function getText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'rich_text') return prop.rich_text.map((t: any) => t.plain_text).join('')
  if (prop.type === 'title') return prop.title.map((t: any) => t.plain_text).join('')
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'date') return prop.date?.start ?? ''
  if (prop.type === 'url') return prop.url ?? ''
  return ''
}

export async function getEvents(): Promise<Event[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [{ property: '日期', direction: 'ascending' }],
  })

  return response.results.map((page: any) => ({
    id: page.id,
    name: getText(page.properties['活動名稱']),
    date: getText(page.properties['日期']),
    time: getText(page.properties['時間']),
    location: getText(page.properties['地點']),
    category: getText(page.properties['類別']),
    fee: getText(page.properties['費用說明']),
    registrationUrl: getText(page.properties['報名連結']) || null,
    status: getText(page.properties['狀態']),
  }))
}

export async function getEvent(id: string): Promise<Event | null> {
  try {
    const page: any = await notion.pages.retrieve({ page_id: id })
    return {
      id: page.id,
      name: getText(page.properties['活動名稱']),
      date: getText(page.properties['日期']),
      time: getText(page.properties['時間']),
      location: getText(page.properties['地點']),
      category: getText(page.properties['類別']),
      fee: getText(page.properties['費用說明']),
      registrationUrl: getText(page.properties['報名連結']) || null,
      status: getText(page.properties['狀態']),
    }
  } catch {
    return null
  }
}
