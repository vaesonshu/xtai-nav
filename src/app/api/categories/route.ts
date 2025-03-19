// app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/db/db' // 确保导入你的 Prisma 客户端

// 处理 GET 请求
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: {
        name: 'asc', // 按名称升序排序
      },
    })
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
