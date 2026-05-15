import { createAgentUIStreamResponse } from 'ai'
import { getCurrentUserId } from '@/lib/auth-client'
import { isAdmin } from '@/lib/utils'
import { websiteCollectorAgent } from '@/lib/agents/website-collector-agent'

export const maxDuration = 300

/** 网站搜集 Agent 流式对话（仅管理员） */
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId || !(await isAdmin(userId))) {
      return new Response(JSON.stringify({ error: '无权限访问' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { messages } = await req.json()

    return createAgentUIStreamResponse({
      agent: websiteCollectorAgent,
      uiMessages: messages,
    })
  } catch (error) {
    console.error('Agent collect API error:', error)
    return new Response(JSON.stringify({ error: '搜集助手请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
