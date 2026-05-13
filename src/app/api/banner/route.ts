import { NextResponse } from 'next/server'
import { db } from '@/db/db'

export async function GET() {
  try {
    const config = await db.bannerConfig.findUnique({
      where: { id: 'singleton' },
    })
    return NextResponse.json(config ?? { enabled: false })
  } catch (error) {
    console.error('获取广告栏 API 失败:', error)
    return NextResponse.json({ enabled: false })
  }
}
