// app/api/visit/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { currentDate } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    // 从 request.headers 获取头信息
    const headers = request.headers
    const userAgent = headers.get('user-agent') || 'unknown'
    const ip = headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const referer = headers.get('referer') || '/'
    const path = new URL(referer).pathname

    // 记录每次访问
    await db.visit.create({
      data: { ip, userAgent, path, createdAt: currentDate() },
    })

    // 检查唯一访客
    const existingVisitor = await db.uniqueVisitor.findUnique({ where: { ip } })
    let isNewVisitor = false

    if (existingVisitor) {
      await db.uniqueVisitor.update({
        where: { ip },
        data: { lastVisit: currentDate(), visitCount: { increment: 1 } },
      })
    } else {
      await db.uniqueVisitor.create({
        data: {
          ip,
          firstVisit: currentDate(),
          lastVisit: currentDate(),
          visitCount: 1,
        },
      })
      isNewVisitor = true
    }

    // 更新统计数据
    const stats = await db.visitStats.upsert({
      where: { id: 'singleton' },
      update: {
        count: { increment: 1 },
        uniqueCount: isNewVisitor ? { increment: 1 } : undefined,
      },
      create: {
        id: 'singleton',
        count: 1,
        uniqueCount: 1,
        updatedAt: currentDate(),
      },
    })

    return NextResponse.json(
      { totalVisits: stats.count, uniqueVisitors: stats.uniqueCount },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to increment visit count:', error)
    return NextResponse.json(
      { error: 'Failed to increment visit count' },
      { status: 500 }
    )
  }
}
