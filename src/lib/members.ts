import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DATABASE_ID!
const REGISTRATIONS_DB_ID = process.env.NOTION_REGISTRATIONS_DATABASE_ID!

export type Member = {
  id: string
  name: string
  email: string
  memberType: '一般里民' | '資深里民'
  status: '啟用' | '停用'
}

export async function getMemberByEmail(email: string): Promise<Member | null> {
  const res = await notion.databases.query({
    database_id: MEMBERS_DB_ID,
    filter: {
      property: 'Email',
      email: { equals: email },
    },
  })
  if (!res.results.length) return null
  const page = res.results[0] as any
  return {
    id: page.id,
    name: page.properties['姓名']?.title?.map((t: any) => t.plain_text).join('') ?? '',
    email: page.properties['Email']?.email ?? '',
    memberType: page.properties['身份']?.select?.name ?? '一般里民',
    status: page.properties['狀態']?.select?.name ?? '啟用',
  }
}

export async function isUserRegistered(eventId: string, memberEmail: string): Promise<boolean> {
  const res = await notion.databases.query({
    database_id: REGISTRATIONS_DB_ID,
    filter: {
      and: [
        { property: '活動ID', rich_text: { equals: eventId } },
        { property: '里民Email', rich_text: { equals: memberEmail } },
        { property: '狀態', select: { equals: '已報名' } },
      ],
    },
  })
  return res.results.length > 0
}

export async function registerForEvent(
  eventId: string,
  eventName: string,
  memberEmail: string,
  memberName: string,
  paymentNote: string
): Promise<{ ok: boolean; duplicate: boolean }> {
  const existing = await notion.databases.query({
    database_id: REGISTRATIONS_DB_ID,
    filter: {
      and: [
        { property: '活動ID', rich_text: { equals: eventId } },
        { property: '里民Email', rich_text: { equals: memberEmail } },
        { property: '狀態', select: { equals: '已報名' } },
      ],
    },
  })
  if (existing.results.length > 0) return { ok: true, duplicate: true }

  await notion.pages.create({
    parent: { database_id: REGISTRATIONS_DB_ID },
    properties: {
      '活動名稱': { title: [{ text: { content: eventName } }] },
      '活動ID': { rich_text: [{ text: { content: eventId } }] },
      '里民Email': { rich_text: [{ text: { content: memberEmail } }] },
      '姓名': { rich_text: [{ text: { content: memberName } }] },
      '報名時間': { date: { start: new Date().toISOString() } },
      '狀態': { select: { name: '已報名' } },
      '付款備註': { rich_text: [{ text: { content: paymentNote } }] },
    },
  })
  return { ok: true, duplicate: false }
}
