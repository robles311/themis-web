import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { validatePassword } from './user-db'

export const authConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const user = await validatePassword(
          credentials.email as string,
          credentials.password as string
        )
        if (!user) return null
        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'demo-secret-change-in-production',
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user }: { user: any }) {
      return !!user
    },
  },
  pages: {
    signIn: '/login',
  },
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
