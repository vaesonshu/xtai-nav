'use server'

import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { db } from '@/db/db'

export async function createOrUpdateUser() {
  try {
    const headers = new Headers()
    const cookieStore = await cookies()
    cookieStore.getAll().forEach((cookie) => {
      headers.append('Cookie', `${cookie.name}=${cookie.value}`)
    })

    const session = await auth.api.getSession({ headers })
    if (!session?.user?.id) {
      return {
        error: 'Unauthorized',
      }
    }

    const user = session.user
    const userId = user.id

    // Check if user exists
    const dbUser = await db.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (dbUser) {
      // Update existing user
      await db.user.update({
        where: {
          id: userId,
        },
        data: {
          name: user.name,
          image: user.image,
          email: user.email,
        },
      })
    } else {
      // Create new user
      await db.user.create({
        data: {
          id: userId,
          name: user.name,
          image: user.image,
          email: user.email,
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving user:', error)
    return { error: 'Failed to save user information' }
  }
}

export async function getUserInfo(id: string) {
  const userInfo = await db.user.findUnique({
    where: {
      id,
    },
  })

  return userInfo
}
