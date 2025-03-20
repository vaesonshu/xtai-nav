'use server'

import { db } from '@/db/db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function getMessages(
  page = 1,
  limit = 10,
  parentId: string | null = null
) {
  try {
    const skip = (page - 1) * limit

    // Get only top-level messages (no parentId) if parentId is null
    const where = parentId === null ? { parentId: null } : { parentId }

    const [messages, totalCount] = await Promise.all([
      db.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' }, // ✅ 这里改成数组
          { createdAt: 'desc' }, // ✅ 这里改成数组
        ],
        include: {
          replies: {
            orderBy: {
              createdAt: 'asc',
            },
            take: 3, // Preview only first 3 replies
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
      }),
      db.message.count({ where }),
    ])

    return {
      success: true,
      messages,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
      },
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: 'Failed to fetch messages' }
  }
}

export async function getReplies(parentId: string, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const [replies, totalCount] = await Promise.all([
      db.message.findMany({
        where: { parentId },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'asc',
        },
      }),
      db.message.count({ where: { parentId } }),
    ])

    return {
      success: true,
      replies,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
      },
    }
  } catch (error) {
    console.error('Error fetching replies:', error)
    return { success: false, error: 'Failed to fetch replies' }
  }
}

export async function createMessage(formData: FormData) {
  const content = formData.get('content') as string
  const author = formData.get('author') as string
  const parentId = (formData.get('parentId') as string) || null

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
        parentId: parentId || null,
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

export async function likeMessage(id: string) {
  try {
    await db.message.update({
      where: { id },
      data: {
        likes: {
          increment: 1,
        },
      },
    })

    revalidatePath('/message-board')
    return { success: true }
  } catch (error) {
    console.error('Error liking message:', error)
    return { success: false, error: '点赞失败' }
  }
}

export async function togglePinMessage(id: string) {
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
      return { success: false, error: '只有管理员可以置顶留言' }
    }

    const message = await db.message.findUnique({
      where: { id },
    })

    if (!message) {
      return { success: false, error: '留言不存在' }
    }

    await db.message.update({
      where: { id },
      data: {
        isPinned: !message.isPinned,
      },
    })

    revalidatePath('/message-board')
    return { success: true }
  } catch (error) {
    console.error('Error toggling pin status:', error)
    return { success: false, error: '操作失败' }
  }
}
