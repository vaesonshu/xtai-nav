import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/db'

// GET /api/logs - 获取日志列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [logs, total] = await Promise.all([
      db.log.findMany({
        where,
        orderBy: [
          { isPinned: 'desc' }, // 置顶的排在前面
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.log.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

// POST /api/logs - 创建新日志
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, createdAt } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const log = await db.log.create({
      data: {
        title,
        content,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Failed to create log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}

// PUT /api/logs/[id] - 更新日志 (通过查询参数传递id)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { title, content, createdAt } = body

    const log = await db.log.update({
      where: { id },
      data: {
        title,
        content,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Failed to update log:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update log' }, { status: 500 })
  }
}

// PATCH /api/logs/[id]/pin - 切换日志置顶状态 (通过查询参数传递id)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 })
    }

    // 获取当前日志的置顶状态
    const currentLog = await db.log.findUnique({
      where: { id },
      select: { isPinned: true },
    })

    if (!currentLog) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }

    // 切换置顶状态
    const log = await db.log.update({
      where: { id },
      data: {
        isPinned: !currentLog.isPinned,
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Failed to toggle log pin:', error)
    return NextResponse.json(
      { error: 'Failed to toggle log pin' },
      { status: 500 }
    )
  }
}

// DELETE /api/logs/[id] - 删除日志 (通过查询参数传递id)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 })
    }

    await db.log.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Log deleted successfully' })
  } catch (error) {
    console.error('Failed to delete log:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 })
  }
}
