import { createHmac, timingSafeEqual } from 'crypto'

function hmac(payload: string): string {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET not set')
  return createHmac('sha256', secret).update(payload).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

// 後台 session cookie：存 HMAC 簽章而非密碼本身
export function adminCookieValue(): string {
  return hmac('admin-session')
}

export function isAdminCookie(val: string | undefined): boolean {
  if (!val || !process.env.ADMIN_SECRET) return false
  try {
    return safeEqual(val, adminCookieValue())
  } catch {
    return false
  }
}

// 核准連結簽章：只對特定 email 有效，不暴露主密碼
export function approveSig(email: string): string {
  return hmac(`approve:${email.toLowerCase()}`)
}

export function isValidApproveSig(email: string, sig: string | null): boolean {
  if (!sig || !process.env.ADMIN_SECRET) return false
  try {
    return safeEqual(sig, approveSig(email))
  } catch {
    return false
  }
}

// 加入表單 token（30 分鐘一個 slot，接受當前與前一個）
export function makeJoinToken(): string | null {
  if (!process.env.ADMIN_SECRET) return null
  const slot = Math.floor(Date.now() / (30 * 60 * 1000))
  return `${slot}:${hmac(`join:${slot}`)}`
}

export function verifyJoinToken(token: string): boolean {
  if (!process.env.ADMIN_SECRET) return false
  const parts = token.split(':')
  if (parts.length !== 2) return false
  const slot = parseInt(parts[0], 10)
  const now = Math.floor(Date.now() / (30 * 60 * 1000))
  if (slot !== now && slot !== now - 1) return false
  try {
    return safeEqual(parts[1], hmac(`join:${slot}`))
  } catch {
    return false
  }
}

// 登入驗證碼（10 分鐘一個 slot，接受當前與前一個，有效 10–20 分鐘）
function loginSlot(): number {
  return Math.floor(Date.now() / (10 * 60 * 1000))
}

function codeForSlot(email: string, slot: number): string {
  const h = hmac(`login:${email.toLowerCase().trim()}:${slot}`)
  return String(parseInt(h.slice(0, 8), 16) % 1000000).padStart(6, '0')
}

export function makeLoginCode(email: string): string {
  return codeForSlot(email, loginSlot())
}

export function verifyLoginCode(email: string, code: string): boolean {
  if (!code || !/^\d{6}$/.test(code) || !process.env.ADMIN_SECRET) return false
  const now = loginSlot()
  try {
    return safeEqual(code, codeForSlot(email, now)) || safeEqual(code, codeForSlot(email, now - 1))
  } catch {
    return false
  }
}
