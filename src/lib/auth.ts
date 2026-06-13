import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getMemberByEmail } from './members'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'email-login',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null
        const member = await getMemberByEmail(credentials.email)
        if (!member || member.status !== '啟用') return null
        return { id: member.id, email: member.email, name: member.name }
      },
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
