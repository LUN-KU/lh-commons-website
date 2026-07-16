import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const MEMBERS_DB_ID = process.env.NOTION_MEMBERS_DATABASE_ID!
const REGISTRATIONS_DB_ID = process.env.NOTION_REGISTRATIONS_DATABASE_ID!

export type Member = {
  id: string
  name: string
  email: string
  memberType: '一般里民' | '資深里民'
  status: '啟用' | '停用' | '待審核'
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

export type MemberPoints = {
  pageId: string
  balance: number
  total: number
  redeemedEvents: string[]
  memberType: string
  status: string
  lastMonthlyGrant: string
}

function parseRedeemed(prop: any): string[] {
  const text = prop?.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
  return text.split(',').map((s: string) => s.trim()).filter(Boolean)
}

export async function getMemberPointsByEmail(email: string): Promise<MemberPoints | null> {
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
    pageId: page.id,
    balance: page.properties['點數餘額']?.number ?? 0,
    total: page.properties['累積點數']?.number ?? 0,
    redeemedEvents: parseRedeemed(page.properties['已集點活動']),
    memberType: page.properties['身份']?.select?.name ?? '一般里民',
    status: page.properties['狀態']?.select?.name ?? '',
    lastMonthlyGrant: page.properties['上次月點發放']?.rich_text?.map((t: any) => t.plain_text).join('') ?? '',
  }
}

const MONTHLY_SENIOR_POINTS = 5

// 台灣時間的年月字串，如 2026-07
function currentMonthTW(): string {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 7)
}

// 資深里民每月點數：僅「啟用」中的資深里民，本月未發過才發（開「我的點數」頁時觸發）
export async function grantMonthlyPointsIfDue(member: MemberPoints): Promise<number> {
  const month = currentMonthTW()
  if (member.memberType !== '資深里民') return 0
  if (member.status !== '啟用') return 0
  if (member.lastMonthlyGrant === month) return 0
  await notion.pages.update({
    page_id: member.pageId,
    properties: {
      '點數餘額': { number: member.balance + MONTHLY_SENIOR_POINTS },
      '累積點數': { number: member.total + MONTHLY_SENIOR_POINTS },
      '上次月點發放': { rich_text: [{ text: { content: month } }] },
    },
  })
  return MONTHLY_SENIOR_POINTS
}

// 集點：加點並記錄已集點活動（呼叫端須先確認 eventId 不在 current.redeemedEvents）
export async function addMemberPoints(
  current: MemberPoints,
  eventId: string,
  points: number
): Promise<void> {
  const redeemed = [...current.redeemedEvents, eventId]
  await notion.pages.update({
    page_id: current.pageId,
    properties: {
      '點數餘額': { number: current.balance + points },
      '累積點數': { number: current.total + points },
      '已集點活動': { rich_text: [{ text: { content: redeemed.join(',') } }] },
    },
  })
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
  paymentNote: string,
  eventDate?: string
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
      ...(eventDate ? { '活動日期': { date: { start: eventDate } } } : {}),
    },
  })
  return { ok: true, duplicate: false }
}
