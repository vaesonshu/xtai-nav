import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { db } from '@/db/db'

// 从user-count路由导入activeIPs
import { activeIPs } from '../user-count/route'

export async function GET(request: NextRequest) {
  const headersList = headers()

  // 设置SSE响应头
  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  }

  const encoder = new TextEncoder()

  // 创建一个可读流
  const stream = new ReadableStream({
    async start(controller) {
      // 发送初始消息
      controller.enqueue(
        encoder.encode('event: connected\ndata: Connected to SSE\n\n')
      )

      // 每秒发送一次用户数量更新
      const userCountInterval = setInterval(async () => {
        try {
          // 使用activeIPs的大小作为用户数量
          const countData = {
            count: activeIPs.size,
          }

          controller.enqueue(
            encoder.encode(
              `event: userCount\ndata: ${JSON.stringify(countData)}\n\n`
            )
          )
        } catch (error) {
          console.error('Error fetching user count:', error)
          // 发送错误时的默认数据
          controller.enqueue(
            encoder.encode(
              `event: userCount\ndata: ${JSON.stringify({ count: 0, error: true })}\n\n`
            )
          )
        }
      }, 5000)

      // 每秒检查一次新消息
      let lastMessageTime = new Date()

      const messageInterval = setInterval(async () => {
        try {
          const newMessages = await db.message.findMany({
            where: {
              createdAt: {
                gt: lastMessageTime,
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
          })

          if (newMessages.length > 0) {
            lastMessageTime = newMessages[newMessages.length - 1].createdAt

            controller.enqueue(
              encoder.encode(
                `event: messages\ndata: ${JSON.stringify(newMessages)}\n\n`
              )
            )
          }
        } catch (error) {
          console.error('Error fetching new messages:', error)
          // 发送错误时的空数组
          controller.enqueue(
            encoder.encode(`event: messages\ndata: ${JSON.stringify([])}\n\n`)
          )
        }
      }, 1000)

      // 当连接关闭时清除定时器
      request.signal.addEventListener('abort', () => {
        clearInterval(userCountInterval)
        clearInterval(messageInterval)
      })
    },
  })

  return new Response(stream, { headers: responseHeaders })
}
