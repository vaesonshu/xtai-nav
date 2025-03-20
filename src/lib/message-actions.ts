'use server'

import { db } from '@/db/db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function getMessages(limit = 50) {
  try {
    const messages = await db.message.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, messages }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: 'Failed to fetch messages' }
  }
}

export async function createMessage(formData: FormData) {
  const content = formData.get('content') as string
  const author = formData.get('author') as string

  if (!content || content.trim() === '') {
    return { success: false, error: '留言内容不能为空' }
  }

  if (!author || author.trim() === '') {
    return { success: false, error: '请输入您的昵称' }
  }

  try {
    // Check if user is logged in and is admin
    const { userId } = await auth()
    let isAdmin = false

    if (userId) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
      })
      isAdmin = user?.role === 'ADMIN'
    }

    const message = await db.message.create({
      data: {
        content: content.trim(),
        author: author.trim(),
        isAdmin,
      },
    })

    revalidatePath('/message-board')
    return { success: true, message }
  } catch (error) {
    console.error('Error creating message:', error)
    return { success: false, error: '留言发送失败，请稍后再试' }
  }
}

export async function deleteMessage(id: string) {
  try {
    // Check if user is admin
    const { userId } = await auth()

    if (!userId) {
      return { success: false, error: '未授权操作' }
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, error: '只有管理员可以删除留言' }
    }

    await db.message.delete({
      where: { id },
    })

    revalidatePath('/message-board')
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: '删除留言失败' }
  }
}
