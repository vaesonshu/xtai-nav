import { type NextRequest, NextResponse } from 'next/server'

// 存储IP地址的Set，导出以便其他模块使用
export const activeIPs = new Set<string>()

// 获取当前用户数
export async function GET() {
  try {
    return NextResponse.json({ count: activeIPs.size })
  } catch (error) {
    console.error('Failed to fetch user count:', error)
    return NextResponse.json({ count: 0, error: true }, { status: 500 })
  }
}

// 增加用户数
export async function POST(request: NextRequest) {
  try {
    // 获取用户IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 添加到活跃IP集合
    activeIPs.add(ip)

    return NextResponse.json({ count: activeIPs.size })
  } catch (error) {
    console.error('Failed to increment user count:', error)
    return NextResponse.json(
      { error: 'Failed to increment user count' },
      { status: 500 }
    )
  }
}

// 减少用户数
export async function DELETE(request: NextRequest) {
  try {
    // 获取用户IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 从活跃IP集合中移除
    activeIPs.delete(ip)

    return NextResponse.json({ count: activeIPs.size })
  } catch (error) {
    console.error('Failed to decrement user count:', error)
    return NextResponse.json(
      { error: 'Failed to decrement user count' },
      { status: 500 }
    )
  }
}
