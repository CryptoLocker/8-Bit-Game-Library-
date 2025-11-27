import type { NextAuthOptions, Session, User } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { findUserByEmail } from "@/lib/users"
import { verifyPassword } from "@/lib/password"
import type { JWT } from "next-auth/jwt"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<"email" | "password", string>) {
        const email = credentials?.email?.toLowerCase()
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const existingUser = await findUserByEmail(email)
        if (!existingUser) {
          return null
        }

        const isValid = await verifyPassword(password, existingUser.passwordHash)
        if (!isValid) {
          return null
        }

        return {
          id: existingUser._id?.toString() ?? "",
          email: existingUser.email,
          name: existingUser.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | null }) {
      if (user?.id) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
}
