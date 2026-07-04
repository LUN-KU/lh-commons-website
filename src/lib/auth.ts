import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getMemberByEmail } from './members'
import { verifyLoginCode } from './adminAuth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'email-login',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: '驗證碼', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null
        const email = credentials.email.trim()
        if (!verifyLoginCode(email, credentials.code.trim())) throw new Error('CODE')

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
