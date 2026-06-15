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
  regularFee: string
  memberFee: string
  earlyFee: string
  registrationUrl: string | null
  status: string
  coverImage: string | null
  iconImage: string | null
  memberOnly: boolean
}

function getCover(page: any): string | null {
  if (!page.cover) return null
  if (page.cover.type === 'external') return page.cover.external.url
  if (page.cover.type === 'file') return page.cover.file.url
  return null
}

function getIcon(page: any): string | null {
  if (!page.icon) return null
  if (page.icon.type === 'external') return page.icon.external.url
  if (page.icon.type === 'file') return page.icon.file.url
  return null
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
    regularFee: getText(page.properties['一般里民費用']),
    memberFee: getText(page.properties['資深里民費用']),
    earlyFee: getText(page.properties['早鳥里民費用']),
    registrationUrl: getText(page.properties['報名連結']) || null,
    status: getText(page.properties['狀態']),
    coverImage: getCover(page),
    iconImage: getIcon(page),
    memberOnly: page.properties['會員限定']?.checkbox ?? false,
  }))
}

// 關於我們頁面 ID（/about 使用）
const ABOUT_PAGE_ID = '37a6dc6e-c222-807e-91f7-edbc0eb4cf14'
// 首頁編輯頁面 ID（首頁 intro / tagline 說明使用）
const HOMEPAGE_PAGE_ID = '3806dc6e-c222-806b-a56c-cef49ff3d130'
// 合作專區頁面 ID（/collab 使用）
const COLLAB_PAGE_ID = '3806dc6e-c222-80b1-8808-fad280da08c6'
// 服務連結頁面 ID
const LINKS_PAGE_ID = '37a6dc6e-c222-80ef-b8fb-ef384b935e3b'

export type SiteSettings = {
  about: string
  joinUs: string
  memberCount: string
  eventsPerMonth: string
}

export type SiteLink = {
  emoji: string
  title: string
  description: string
  url: string
}

async function parseKeyValueBlocks(pageId: string): Promise<Record<string, string>> {
  const res = await notion.blocks.children.list({ block_id: pageId })
  const blocks = res.results as any[]
  const map: Record<string, string> = {}
  let currentKey = ''
  for (const block of blocks) {
    const text = block.paragraph?.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
    if (text.startsWith('# ')) {
      currentKey = text.slice(2).trim()
    } else if (currentKey && text.trim()) {
      map[currentKey] = text.trim()
      currentKey = ''
    }
  }
  return map
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const map = await parseKeyValueBlocks(ABOUT_PAGE_ID)
  return {
    about: map['關於我們介紹'] ?? '',
    joinUs: map['加入我們說明'] ?? '',
    memberCount: map['里民人數'] ?? '700+',
    eventsPerMonth: map['每月活動場數'] ?? '10-15',
  }
}

export async function getHomePageSettings(): Promise<{ intro: string; taglineDesc: string }> {
  const map = await parseKeyValueBlocks(HOMEPAGE_PAGE_ID)
  return {
    intro: map['首頁介紹'] ?? '',
    taglineDesc: map['標語說明'] ?? '',
  }
}

export async function getCollabBlocks(): Promise<NotionBlock[]> {
  const res = await notion.blocks.children.list({ block_id: COLLAB_PAGE_ID, page_size: 100 })
  return res.results as NotionBlock[]
}

export async function getSiteLinks(): Promise<SiteLink[]> {
  const res = await notion.blocks.children.list({ block_id: LINKS_PAGE_ID })
  const blocks = res.results as any[]

  const links: SiteLink[] = []
  for (const block of blocks) {
    const text = block.paragraph?.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
    if (!text.includes(' | ')) continue
    const parts = text.split(' | ')
    if (parts.length < 4) continue
    links.push({
      emoji: parts[0].trim(),
      title: parts[1].trim(),
      description: parts[2].trim(),
      url: parts[3].trim(),
    })
  }
  return links
}

export type NotionBlock = {
  id: string
  type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function getEventBlocks(pageId: string): Promise<NotionBlock[]> {
  const res = await notion.blocks.children.list({ block_id: pageId, page_size: 100 })
  return res.results as NotionBlock[]
}

// 首頁活動介紹圖頁面 ID
const ACTIVITY_FEATURED_PAGE_ID = '37c6dc6ec22281c9bf6cc261dd02bb65'

export async function getActivityFeaturedImage(): Promise<string | null> {
  const res = await notion.blocks.children.list({ block_id: ACTIVITY_FEATURED_PAGE_ID, page_size: 10 })
  for (const block of res.results as any[]) {
    if (block.type === 'image') {
      const img = block.image
      return img.type === 'file' ? img.file.url : img.external?.url ?? null
    }
  }
  return null
}

// 活動紀錄相片頁面 ID
const ACTIVITY_PHOTOS_PAGE_ID = '37c6dc6ec22281b284d6ea0e3e5f7ff2'

export async function getActivityPhotos(): Promise<string[]> {
  const res = await notion.blocks.children.list({ block_id: ACTIVITY_PHOTOS_PAGE_ID, page_size: 50 })
  const urls: string[] = []
  for (const block of res.results as any[]) {
    if (block.type === 'image') {
      const img = block.image
      const url = img.type === 'file' ? img.file.url : img.external?.url
      if (url) urls.push(url)
    }
  }
  return urls.slice(0, 6)
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
      regularFee: getText(page.properties['一般里民費用']),
      memberFee: getText(page.properties['資深里民費用']),
      earlyFee: getText(page.properties['早鳥里民費用']),
      registrationUrl: getText(page.properties['報名連結']) || null,
      status: getText(page.properties['狀態']),
      coverImage: getCover(page),
      iconImage: getIcon(page),
      memberOnly: page.properties['會員限定']?.checkbox ?? false,
    }
  } catch {
    return null
  }
}
