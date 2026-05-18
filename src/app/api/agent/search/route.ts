import { createAgentUIStreamResponse } from 'ai'
import { getCurrentUserId } from '@/lib/auth-client'
import { isAdmin } from '@/lib/utils'
import { websiteSearchAgent } from '@/lib/agents/website-search-agent'
import {
  discoverSkills,
  getWebsiteSearchSkillsRoot,
} from '@/lib/agents/skill-utils'

export const maxDuration = 120

/** 站内 + 外网搜索 Agent：注入技能元数据，供 loadSkill 与系统提示使用 */
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
    const skills = await discoverSkills(getWebsiteSearchSkillsRoot())

    console.log('messages', messages)
    console.log('skills', skills)
    return createAgentUIStreamResponse({
      agent: websiteSearchAgent,
      uiMessages: messages,
      options: { skills },
    })
  } catch (error) {
    console.error('Agent search API error:', error)
    return new Response(JSON.stringify({ error: '搜索助手请求失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
