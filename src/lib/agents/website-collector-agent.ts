import { deepseek } from '@ai-sdk/deepseek'
import {
  ToolLoopAgent,
  tool,
  stepCountIs,
  type InferAgentUIMessage,
  type ToolSet,
} from 'ai'
import { z } from 'zod'
import { resolveBestFaviconUrl } from '@/lib/favicon-resolve'
import { db } from '@/db/db'

// 候选网站数据结构（与数据库 Website 字段对齐）
export const collectedWebsiteSchema = z.object({
  name: z.string().describe('网站名称'),
  url: z.string().describe('网站完整 URL，需包含 https://'),
  iconUrl: z
    .string()
    .optional()
    .describe('网站图标直链，可选；留空则在提交候选时由服务端自动探测 favicon'),
  description: z.string().describe('网站简介，50-150 字'),
  tags: z.array(z.string()).describe('标签，3-6 个'),
  categoryIds: z
    .array(z.string())
    .describe('分类 ID，须来自 listCategories 工具返回的 id'),
})

export type CollectedWebsite = z.infer<typeof collectedWebsiteSchema>

// Agent 工具：查询现有分类
const listCategories = tool({
  description: '获取导航站数据库中所有分类，用于为候选网站匹配 categoryIds',
  inputSchema: z.object({}),
  execute: async () => {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, icon: true },
    })
    return { categories, total: categories.length }
  },
})

// Agent 工具：检查 URL 是否已收录
const checkExistingUrls = tool({
  description: '检查一批 URL 是否已在数据库中，避免重复推荐',
  inputSchema: z.object({
    urls: z.array(z.string()).describe('待检查的 URL 列表'),
  }),
  execute: async ({ urls }) => {
    const normalized = urls.map((u) => u.trim()).filter(Boolean)
    if (normalized.length === 0) {
      return { existing: [], newUrls: [] }
    }
    const existing = await db.website.findMany({
      where: { url: { in: normalized } },
      select: { url: true, name: true, approvalStatus: true },
    })
    const existingSet = new Set(existing.map((w) => w.url))
    return {
      existing,
      newUrls: normalized.filter((u) => !existingSet.has(u)),
    }
  },
})

// Agent 工具：提交候选列表（供管理端展示与筛选，不直接入库）
const reportWebsiteCandidates = tool({
  description:
    '在搜集并整理完成后调用，提交最终候选网站列表供管理员筛选入库。调用前应先 listCategories 与 checkExistingUrls。',
  inputSchema: z.object({
    websites: z.array(collectedWebsiteSchema),
    summary: z.string().optional().describe('本次搜集的简要说明'),
  }),
  execute: async ({ websites, summary }) => {
    // 并行探测图标，避免仅依赖模型填写的 Google s2 等单源失效
    const enriched = await Promise.all(
      websites.map(async (w) => {
        if (w.iconUrl?.trim()) return { ...w, iconUrl: w.iconUrl.trim() }
        const iconUrl = await resolveBestFaviconUrl(w.url)
        return { ...w, iconUrl }
      })
    )
    return {
      websites: enriched,
      summary: summary ?? '',
      count: enriched.length,
    }
  },
})

const collectorTools = {
  listCategories,
  checkExistingUrls,
  reportWebsiteCandidates,
}

const COLLECTOR_INSTRUCTIONS_BASE = `你是「星途导航」管理后台的网站搜集助手，专门帮助管理员发现、整理优质网站并匹配到正确分类。

工作流程：
1. 理解管理员的主题或需求（如「AI 绘图工具」「前端开发资源」）。
2. 调用 listCategories 获取现有分类，为每个网站选择最合适的 categoryIds（可多选）。
3. 推荐真实、可访问、有价值的网站；每个网站需包含 name、url、description、tags、categoryIds。
4. iconUrl 可留空：提交 reportWebsiteCandidates 时服务端会按首页依次探测 /favicon.ico 及多家图标 CDN。
5. 在提交前调用 checkExistingUrls 过滤已收录链接，不要推荐已存在的 URL。
6. 整理完成后必须调用 reportWebsiteCandidates 提交候选列表（通常 5-15 个，按需求调整）。

注意：
- 只推荐与主题高度相关的网站，优先知名、活跃的产品。
- url 必须合法且带协议（https://）。
- 使用中文描述与标签。
- 若管理员要求修改，可重新搜集并再次调用 reportWebsiteCandidates。`

const COLLECTOR_INSTRUCTIONS_MCP = `

## MCP 外部工具
当前请求已连接 Model Context Protocol 工具。可用于检索开放网页、读取外部资源等，与「星途导航」站内数据互补。
- 搜集时优先结合 MCP 结果与常识交叉验证，避免陈旧或错误链接。
- 仍须调用 listCategories、checkExistingUrls，并最终通过 reportWebsiteCandidates 提交候选。
- 若 MCP 与内置工具同名，以内置工具为准。`

/**
 * 工厂：合并 MCP 工具（mcpTools 在前）与内置工具，同名键由内建工具覆盖，避免被外部抢占。
 */
export function createWebsiteCollectorAgent(mcpTools: ToolSet = {}) {
  const hasMcp = Object.keys(mcpTools).length > 0
  const mergedTools = { ...mcpTools, ...collectorTools }

  return new ToolLoopAgent({
    model: deepseek('deepseek-chat'),
    stopWhen: stepCountIs(18),
    tools: mergedTools,
    instructions: hasMcp
      ? `${COLLECTOR_INSTRUCTIONS_BASE}${COLLECTOR_INSTRUCTIONS_MCP}`
      : COLLECTOR_INSTRUCTIONS_BASE,
  })
}

/** 默认实例（无 MCP），用于类型推断与未配置 MCP 时的路由 */
export const websiteCollectorAgent = createWebsiteCollectorAgent()

export type WebsiteCollectorUIMessage = InferAgentUIMessage<
  typeof websiteCollectorAgent
>
