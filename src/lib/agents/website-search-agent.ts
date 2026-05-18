import { deepseek } from '@ai-sdk/deepseek'
import type { Prisma } from '@prisma/client'
import { readFile } from 'fs/promises'
import path from 'path'
import { ToolLoopAgent, tool, stepCountIs, type InferAgentUIMessage } from 'ai'
import { z } from 'zod'
import { searchBingWeb } from '@/lib/agents/bing-search'
import {
  buildSkillsPromptSection,
  stripSkillFrontmatter,
  type SkillMetadata,
} from '@/lib/agents/skill-utils'
import { db } from '@/db/db'

/** 每次请求注入的技能列表（与 createAgentUIStreamResponse 的 options 对齐） */
const websiteSearchCallOptionsSchema = z.object({
  skills: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      path: z.string(),
    })
  ),
})

export type WebsiteSearchCallOptions = z.infer<
  typeof websiteSearchCallOptionsSchema
>

// 与 AI SDK v6 ToolLoopAgent 一致
const listCategories = tool({
  description: '获取导航站所有分类（含 id、slug），过滤或解释分类时请优先调用',
  inputSchema: z.object({}),
  execute: async () => {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true, icon: true },
    })
    return { categories, total: categories.length }
  },
})

const searchNavWebsites = tool({
  description:
    '按关键词、分类 slug、标签检索导航站中的网站。需要包含待审批站点时设置 includeNonApproved: true。',
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe('搜索关键词，匹配名称、描述或标签（模糊匹配）'),
    categorySlug: z
      .string()
      .optional()
      .describe('分类 slug，须与 listCategories 返回值一致'),
    tag: z.string().optional().describe('精确匹配某一标签'),
    includeNonApproved: z
      .boolean()
      .optional()
      .describe('为 true 时包含待审批/未通过站点（全库盘点时使用）'),
    limit: z
      .number()
      .min(1)
      .max(40)
      .optional()
      .describe('返回条数上限，默认 20'),
  }),
  execute: async ({
    query,
    categorySlug,
    tag,
    includeNonApproved,
    limit = 20,
  }) => {
    const where: Prisma.WebsiteWhereInput = {}

    if (!includeNonApproved) {
      where.isApproved = true
      where.approvalStatus = 'approved'
    }

    const q = query?.trim()
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ]
    }

    if (categorySlug?.trim()) {
      where.categories = {
        some: { category: { slug: categorySlug.trim() } },
      }
    }

    if (tag?.trim()) {
      where.tags = { has: tag.trim() }
    }

    const take = Math.min(Math.max(limit, 1), 40)

    const [websites, total] = await Promise.all([
      db.website.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take,
        select: {
          id: true,
          name: true,
          url: true,
          iconUrl: true,
          description: true,
          tags: true,
          views: true,
          approvalStatus: true,
          isApproved: true,
          categories: {
            select: {
              category: { select: { name: true, slug: true } },
            },
          },
        },
      }),
      db.website.count({ where }),
    ])

    return {
      websites: websites.map((w) => ({
        ...w,
        categories: w.categories.map((c) => c.category),
      })),
      total,
      returned: websites.length,
    }
  },
})

// 必应外网检索（密钥在服务端环境变量，见 bing-search.ts）
const webSearch = tool({
  description:
    '使用必应 Web Search API 检索互联网摘要。适用于库内无结果、需要新站点或最新资讯；返回标题/链接/摘要供整理。',
  inputSchema: z.object({
    query: z.string().describe('搜索查询词，尽量具体'),
    count: z.number().min(1).max(10).optional().describe('返回条数，默认 5'),
  }),
  execute: async ({ query, count = 5 }) => {
    const out = await searchBingWeb(query, count)
    if (!out.ok) {
      return { error: out.error, hint: out.hint }
    }
    return { results: out.results, source: 'bing-web' }
  },
})

// 按需加载 SKILL.md 正文（渐进披露），见 https://ai-sdk.dev/cookbook/guides/agent-skills#skills
const loadSkill = tool({
  description:
    '加载指定 Agent Skill 的 Markdown 说明（不含 frontmatter）。在准备外网搜索或复杂库检索前调用以遵循专项流程。',
  inputSchema: z.object({
    name: z.string().describe('技能 name，与系统提示 Skills 列表一致'),
  }),
  execute: async ({ name }, callCtx) => {
    const ctx = callCtx.experimental_context as
      | { skills: SkillMetadata[] }
      | undefined
    const skills = ctx?.skills ?? []
    const skill = skills.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase()
    )
    if (!skill) {
      return { error: `未找到技能: ${name}` }
    }
    const skillFile = path.join(skill.path, 'SKILL.md')
    const content = await readFile(skillFile, 'utf-8')
    const body = stripSkillFrontmatter(content)
    return { skillDirectory: skill.path, content: body }
  },
})

const searchTools = {
  listCategories,
  searchNavWebsites,
  webSearch,
  loadSkill,
}

/**
 * 站内 + 外网搜索 Agent：ToolLoopAgent + callOptionsSchema + prepareCall 注入 Skills 列表。
 */
export const websiteSearchAgent = new ToolLoopAgent<
  WebsiteSearchCallOptions,
  typeof searchTools
>({
  model: deepseek('deepseek-chat'),
  stopWhen: stepCountIs(20),
  callOptionsSchema: websiteSearchCallOptionsSchema,
  prepareCall: ({ options, instructions, ...rest }) => {
    const base = typeof instructions === 'string' ? instructions : ''
    const section = buildSkillsPromptSection(options.skills)
    return {
      ...rest,
      instructions: section ? `${base}\n\n${section}` : base,
      experimental_context: { skills: options.skills },
    }
  },
  tools: searchTools,
  instructions: `你是「星途导航」管理后台的智能检索助手。

核心能力：
1. 站内：listCategories、searchNavWebsites 查询 PostgreSQL 已收录站点。
2. 外网：webSearch 通过必应检索互联网摘要（需部署环境变量，未配置时如实说明）。
3. 技能：对复杂场景先 loadSkill 再执行（参见每次请求追加的 Skills 小节）。

回答要求：
- 中文简洁；数据必须来自工具返回，不编造 URL。
- 可先查库再决定是否外网补充；外链请注明来自必应摘要，供人工复核。
- 分类 slug 不确定时先 listCategories。`,
})

export type WebsiteSearchUIMessage = InferAgentUIMessage<
  typeof websiteSearchAgent
>
