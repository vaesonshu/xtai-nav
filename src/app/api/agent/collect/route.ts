import { createAgentUIStreamResponse } from 'ai'
import { resolveCollectorMcpSession } from '@/lib/mcp/collector-mcp-session'
import {
  createWebsiteCollectorAgent,
  websiteCollectorAgent,
} from '@/lib/agents/website-collector-agent'
import { getCurrentUserId } from '@/lib/auth-client'
import { isAdmin } from '@/lib/utils'

export const maxDuration = 300

/** 网站搜集 Agent：可选 MCP 工具；完成后关闭 MCP 连接释放资源（见 AI SDK MCP Cookbook） */
export async function POST(req: Request) {
  let mcpSession: Awaited<ReturnType<typeof resolveCollectorMcpSession>> = null

  try {
    const userId = await getCurrentUserId()
    if (!userId || !(await isAdmin(userId))) {
      return new Response(JSON.stringify({ error: '无权限访问' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { messages } = await req.json()

    try {
      mcpSession = await resolveCollectorMcpSession()
    } catch (e) {
      console.error('[collector-mcp] 初始化失败，回退为仅内置工具', e)
    }

    const agent = mcpSession
      ? createWebsiteCollectorAgent(mcpSession.tools)
      : websiteCollectorAgent

    const closeMcp = async () => {
      if (mcpSession) {
        try {
          await mcpSession.close()
        } catch (e) {
          console.error('[collector-mcp] close error', e)
        }
        mcpSession = null
      }
    }

    try {
      return await createAgentUIStreamResponse({
        agent,
        uiMessages: messages,
        onFinish: async () => {
          await closeMcp()
        },
        onError: () => {
          void closeMcp()
          return '搜集助手流式响应出错'
        },
      })
    } catch (streamError) {
      await closeMcp()
      throw streamError
    }
  } catch (error) {
    console.error('Agent collect API error:', error)
    return new Response(JSON.stringify({ error: '搜集助手请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
