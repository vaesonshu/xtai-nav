'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db/db'

export async function createOrUpdateUser() {
  const { userId } = await auth()
  const user = await currentUser()

  console.log('user', user)

  if (!userId || !user) {
    return {
      error: 'Unauthorized',
    }
  }

  try {
    // Check if user exists
    const dbUser = await db.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    if (dbUser) {
      // Update existing user
      await db.user.update({
        where: {
          clerkId: userId,
        },
        data: {
          name: user.username ? user.username : user.firstName || null,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0]?.emailAddress || '',
        },
      })
    } else {
      // Create new user
      await db.user.create({
        data: {
          clerkId: userId,
          name: user.username ? user.username : user.firstName || null,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0]?.emailAddress || '',
        },
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving user:', error)
    return { error: 'Failed to save user information' }
  }
}

export async function getUserInfo(clerkId: string) {
  const userInfo = await db.user.findUnique({
    where: {
      clerkId,
    },
  })

  return userInfo
}
