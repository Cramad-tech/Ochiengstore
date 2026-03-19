import { createHash } from "node:crypto"

import NextAuth from "next-auth"
import type { Session } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { JWT } from "next-auth/jwt"
import { compare } from "bcryptjs"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { resolveUserRoles } from "@/lib/rbac"
import { assertRateLimit } from "@/lib/rate-limit"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const authSecret =
  process.env.AUTH_SECRET ??
  process.env.NEXTAUTH_SECRET ??
  (process.env.NODE_ENV === "development"
    ? createHash("sha256")
        .update(`${process.cwd()}:ochieng-home-appliances:dev-auth-secret`)
        .digest("hex")
    : undefined)

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) {
          await prisma.auditLog
            .create({
              data: {
                action: "LOGIN",
                entityType: "Auth",
                message: "Failed account login validation.",
              },
            })
            .catch(() => null)
          return null
        }

        try {
          assertRateLimit(`login:${parsed.data.email.toLowerCase()}`, 8, 60_000)
        } catch {
          await prisma.auditLog
            .create({
              data: {
                action: "LOGIN",
                entityType: "Auth",
                message: "Blocked account login due to rate limiting.",
                metadata: {
                  email: parsed.data.email.toLowerCase(),
                },
              },
            })
            .catch(() => null)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        })

        if (!user || !user.passwordHash || !user.isActive || !user.emailVerifiedAt) {
          await prisma.auditLog
            .create({
              data: {
                action: "LOGIN",
                entityType: "Auth",
                entityId: user?.id ?? null,
                message: "Failed account login attempt.",
                metadata: {
                  email: parsed.data.email.toLowerCase(),
                  emailVerified: user?.emailVerifiedAt ? "yes" : "no",
                },
              },
            })
            .catch(() => null)
          return null
        }

        const isValid = await compare(parsed.data.password, user.passwordHash)
        if (!isValid) {
          await prisma.auditLog
            .create({
              data: {
                userId: user.id,
                action: "LOGIN",
                entityType: "Auth",
                entityId: user.id,
                message: "Rejected account login due to invalid password.",
              },
            })
            .catch(() => null)
          return null
        }

        await prisma.auditLog
          .create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entityType: "Auth",
              entityId: user.id,
              message: "Successful account login.",
            },
          })
          .catch(() => null)

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roles: resolveUserRoles(user.userRoles.map((entry: (typeof user.userRoles)[number]) => entry.role.code)),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { roles?: string[] } | null }) {
      if (user) {
        token.roles = user.roles
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id
        session.user.roles = Array.isArray(token.roles) ? token.roles : []
      }
      return session
    },
  },
  trustHost: true,
})
