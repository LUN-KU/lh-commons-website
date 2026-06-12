import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      memberType?: string
      memberId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    memberType?: string
    memberId?: string
  }
}
