import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getMemberByEmail } from './members'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const member = await getMemberByEmail(user.email)
      return !!(member && member.status === '啟用')
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const member = await getMemberByEmail(user.email)
        if (member) {
          token.memberType = member.memberType
          token.memberId = member.id
        }
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
