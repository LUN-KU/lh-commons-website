import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getMemberByEmail } from './members'

// ⚠️ 臨時方案（2026-08-06）：Resend 尚無已驗證網域，驗證碼信寄不出去，
// 故暫時改回「只輸入 Email」登入。待綁定自有網域後，把驗證碼步驟加回：
// 1) credentials 加回 code 欄位並用 verifyLoginCode 檢查（見 git 或 login-code route）
// 2) LoginButton 改回兩步驟（寄碼 → 輸碼）
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'email-login',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const email = credentials.email.trim()

        let member
        try {
          member = await getMemberByEmail(email)
        } catch {
          throw new Error('SERVICE')
        }
        if (!member) throw new Error('NOT_FOUND')
        if (member.status === '待審核') throw new Error('PENDING')
        if (member.status !== '啟用') throw new Error('NOT_FOUND')
        return {
          id: member.id,
          email: member.email,
          name: member.name,
          memberType: member.memberType,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.memberType = (user as { memberType?: string }).memberType
        token.memberId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.memberType = token.memberType as string | undefined
        session.user.memberId = token.memberId as string | undefined
      }
      return session
    },
  },
  pages: {
    error: '/auth/error',
  },
}
