// app/api/visit/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { currentDate } from '@/lib/utils'

// 时间间隔常量（毫秒）
const VISIT_INTERVAL_MS = 5 * 60 * 1000 // 5分钟

function getRealIP(headers: Headers): string {
  // 优先级从高到低：CF-Connecting-IP, X-Forwarded-For, X-Real-IP, fallback to 'unknown'
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    // 获取第一个IP地址（真实的客户端IP）
    return xForwardedFor.split(',')[0].trim()
  }

  const xRealIP = headers.get('x-real-ip')
  if (xRealIP) return xRealIP.trim()

  return 'unknown'
}

export async function POST(request: Request) {
  try {
    const headers = request.headers
    const userAgent = headers.get('user-agent') || 'unknown'
    const ip = getRealIP(headers)
    const referer = headers.get('referer') || '/'
    const path = new URL(referer).pathname
    const sessionId = headers.get('x-session-id') || 'unknown' // 从客户端发送的会话ID

    // 获取或创建访客记录（基于IP和UserAgent的组合）
    const visitorKey = `${ip}_${userAgent}`
    const existingVisitor = await db.uniqueVisitor.findUnique({
      where: { ip: visitorKey },
    })

    let isNewVisitor = false
    let shouldIncrementUnique = false
    let shouldIncrementTotal = false

    const now = Date.now()
    const currentTimeStr = currentDate()

    if (existingVisitor) {
      const lastVisitTime = new Date(existingVisitor.lastVisit).getTime()

      // 检查是否超过时间间隔
      if (now - lastVisitTime > VISIT_INTERVAL_MS) {
        // 更新最后访问时间，但不增加唯一访客数
        await db.uniqueVisitor.update({
          where: { ip: visitorKey },
          data: { lastVisit: currentTimeStr, visitCount: { increment: 1 } },
        })
        // 全站的唯一访客数（UV）不增加
        shouldIncrementUnique = false
      }
      // 如果在间隔内，不更新唯一访客
    } else {
      // 新访客
      await db.uniqueVisitor.create({
        data: {
          ip: visitorKey,
          firstVisit: currentTimeStr,
          lastVisit: currentTimeStr,
          visitCount: 1,
        },
      })
      isNewVisitor = true
      shouldIncrementUnique = true
    }

    // 总是记录访问详情，但基于时间间隔决定是否计入统计
    if (
      !existingVisitor ||
      now - new Date(existingVisitor.lastVisit).getTime() > VISIT_INTERVAL_MS
    ) {
      shouldIncrementTotal = true
      await db.visit.create({
        data: { ip: visitorKey, userAgent, path, createdAt: currentTimeStr },
      })
    }

    // 更新统计数据
    const updateData: any = {}
    if (shouldIncrementTotal) {
      updateData.count = { increment: 1 }
    }
    if (shouldIncrementUnique) {
      updateData.uniqueCount = { increment: 1 }
    }

    const stats = await db.visitStats.upsert({
      where: { id: 'singleton' },
      update: updateData,
      create: {
        id: 'singleton',
        count: shouldIncrementTotal ? 1 : 0,
        uniqueCount: shouldIncrementUnique ? 1 : 0,
        updatedAt: currentTimeStr,
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
