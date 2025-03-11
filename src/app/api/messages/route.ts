import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/db'

// 获取所有消息
export async function GET() {
  try {
    const messages = await db.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // 限制返回最近的50条消息
    })

    return NextResponse.json(messages || [])
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json([], { status: 500 })
  }
}

// 创建新消息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, author, isAdmin } = body

    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      )
    }

    const message = await db.message.create({
      data: {
        content,
        author,
        isAdmin: isAdmin || false,
      },
    })

    return NextResponse.json(message || {})
  } catch (error) {
    console.error('Failed to create message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
