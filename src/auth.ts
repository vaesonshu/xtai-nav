import NextAuth from 'next-auth'

import GitHub from 'next-auth/providers/github'
// 引入 Email Provider
import Email from 'next-auth/providers/nodemailer'

import type { NextAuthConfig } from 'next-auth'

import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { type Adapter } from 'next-auth/adapters'

const prisma = new PrismaClient()

export const config = {
  theme: {
    logo: 'https://next-auth.js.org/img/logo/logo-sm.png',
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [GitHub],
  basePath: '/auth',
  callbacks: {
    jwt({ token, trigger, session }) {
      if (trigger === 'update') token.name = session.user.name
      return token
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
