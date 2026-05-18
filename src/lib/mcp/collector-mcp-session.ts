/**
 * 网站搜集 Agent — MCP 会话封装
 * - MCP 工具：https://ai-sdk.dev/cookbook/next/mcp-tools
 * - Elicitation：https://ai-sdk.dev/cookbook/node/mcp-elicitation
 */

import type { McpServerConfig } from '@prisma/client'
import {
  createMCPClient,
  ElicitationRequestSchema,
  type MCPClient,
} from '@ai-sdk/mcp'
import { Experimental_StdioMCPTransport } from '@ai-sdk/mcp/mcp-stdio'
import type { ToolSet } from 'ai'
import { db } from '@/db/db'

export type CollectorMcpSession = {
  /** 多个 MCP 合并后的工具（最终与内置工具合并时以内置为准） */
  tools: ToolSet
  close: () => Promise<void>
}

function headersFromJson(
  json: McpServerConfig['headersJson']
): Record<string, string> | undefined {
  if (json == null || typeof json !== 'object' || Array.isArray(json)) {
    return undefined
  }
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function stdioArgsFromJson(json: McpServerConfig['stdioArgs']): string[] {
  if (json == null) return []
  if (!Array.isArray(json) || !json.every((x) => typeof x === 'string')) {
    throw new Error('stdioArgs 须为 JSON 字符串数组')
  }
  return json as string[]
}

function registerElicitationDecline(client: MCPClient, serverName: string) {
  client.onElicitationRequest(ElicitationRequestSchema, async (request) => {
    console.warn(
      `[mcp:${serverName}] elicitation（管理端暂未接表单人机回环）:`,
      request.params.message
    )
    return { action: 'decline' as const }
  })
}

/** 单条数据库配置 → 已连接的 MCP Client */
export async function createMcpClientFromConfig(
  cfg: McpServerConfig
): Promise<MCPClient> {
  const elicitation = cfg.elicitationEnabled
  const onUncaught = (e: unknown) => console.error(`[mcp:${cfg.name}]`, e)

  const transport = cfg.transport.trim().toLowerCase()

  if (transport === 'http' || transport === 'sse') {
    const url = cfg.streamUrl?.trim()
    if (!url) throw new Error(`MCP「${cfg.name}」流式传输需填写 streamUrl`)
    const client = await createMCPClient({
      transport: {
        type: transport as 'http' | 'sse',
        url,
        headers: headersFromJson(cfg.headersJson),
      },
      capabilities: elicitation ? { elicitation: {} } : undefined,
      onUncaughtError: onUncaught,
    })
    if (elicitation) registerElicitationDecline(client, cfg.name)
    return client
  }

  if (transport === 'stdio') {
    const command = cfg.stdioCommand?.trim()
    if (!command) throw new Error(`MCP「${cfg.name}」stdio 需填写命令`)
    const args = stdioArgsFromJson(cfg.stdioArgs)
    const mcpTransport = new Experimental_StdioMCPTransport({
      command,
      args,
      cwd: cfg.stdioCwd?.trim() || undefined,
      env: { ...process.env } as Record<string, string>,
    })
    const client = await createMCPClient({
      transport: mcpTransport,
      capabilities: elicitation ? { elicitation: {} } : undefined,
      onUncaughtError: onUncaught,
    })
    if (elicitation) registerElicitationDecline(client, cfg.name)
    return client
  }

  throw new Error(`不支持的 transport: ${cfg.transport}`)
}

/**
 * 按数据库中已启用的 MCP 配置创建会话（可多路合并 tools，sortOrder 小的先合并，后者可覆盖同名工具）。
 */
export async function createCollectorMcpSessionFromDatabase(): Promise<CollectorMcpSession | null> {
  const configs = await db.mcpServerConfig.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  })
  if (configs.length === 0) return null

  const clients: MCPClient[] = []
  let mergedTools: ToolSet = {}

  try {
    for (const cfg of configs) {
      const client = await createMcpClientFromConfig(cfg)
      clients.push(client)
      const t = await client.tools()
      mergedTools = { ...mergedTools, ...t }
    }
  } catch (e) {
    await Promise.all(clients.map((c) => c.close().catch(() => {})))
    throw e
  }

  return {
    tools: mergedTools,
    close: async () => {
      await Promise.all(clients.map((c) => c.close().catch(() => {})))
    },
  }
}

function parseEnvHeaders(): Record<string, string> | undefined {
  const raw = process.env.WEBSITE_COLLECTOR_MCP_HEADERS?.trim()
  if (!raw) return undefined
  try {
    const v = JSON.parse(raw) as unknown
    if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined
    return v as Record<string, string>
  } catch {
    console.warn('[collector-mcp] WEBSITE_COLLECTOR_MCP_HEADERS 不是合法 JSON')
    return undefined
  }
}

function envElicitationOn(): boolean {
  const v = process.env.WEBSITE_COLLECTOR_MCP_ELICITATION?.toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

/** 兼容旧版：仅环境变量单路 MCP */
export async function createCollectorMcpSessionFromEnv(): Promise<CollectorMcpSession | null> {
  const mode = process.env.WEBSITE_COLLECTOR_MCP_TRANSPORT?.trim().toLowerCase()
  if (!mode || mode === 'off' || mode === '0' || mode === 'false') {
    return null
  }

  const headers = parseEnvHeaders()
  const elicitation = envElicitationOn()
  let client: MCPClient

  if (mode === 'http' || mode === 'sse') {
    const url = process.env.WEBSITE_COLLECTOR_MCP_URL?.trim()
    if (!url) {
      console.warn(
        '[collector-mcp] TRANSPORT 已设但未配置 WEBSITE_COLLECTOR_MCP_URL'
      )
      return null
    }
    client = await createMCPClient({
      transport: { type: mode as 'http' | 'sse', url, headers },
      capabilities: elicitation ? { elicitation: {} } : undefined,
      onUncaughtError: (e) => console.error('[collector-mcp]', e),
    })
  } else if (mode === 'stdio') {
    const command = process.env.WEBSITE_COLLECTOR_MCP_COMMAND?.trim()
    if (!command) {
      console.warn('[collector-mcp] stdio 需要 WEBSITE_COLLECTOR_MCP_COMMAND')
      return null
    }
    let args: string[] = []
    const argsJson = process.env.WEBSITE_COLLECTOR_MCP_ARGS?.trim()
    if (argsJson) {
      try {
        const parsed = JSON.parse(argsJson) as unknown
        if (
          !Array.isArray(parsed) ||
          !parsed.every((x) => typeof x === 'string')
        ) {
          throw new Error('invalid args')
        }
        args = parsed as string[]
      } catch {
        console.warn(
          '[collector-mcp] WEBSITE_COLLECTOR_MCP_ARGS 须为 JSON 字符串数组'
        )
        return null
      }
    }
    const transport = new Experimental_StdioMCPTransport({
      command,
      args,
      env: { ...process.env } as Record<string, string>,
    })
    client = await createMCPClient({
      transport,
      capabilities: elicitation ? { elicitation: {} } : undefined,
      onUncaughtError: (e) => console.error('[collector-mcp]', e),
    })
  } else {
    console.warn(
      `[collector-mcp] 不支持的 WEBSITE_COLLECTOR_MCP_TRANSPORT: ${mode}`
    )
    return null
  }

  if (elicitation) {
    registerElicitationDecline(client, 'env')
  }

  let tools: ToolSet
  try {
    tools = await client.tools()
  } catch (e) {
    await client.close().catch(() => {})
    throw e
  }

  return {
    tools,
    close: () => client.close(),
  }
}

/**
 * 优先使用数据库中的管理员配置；若没有任何启用项则回退到环境变量。
 */
export async function resolveCollectorMcpSession(): Promise<CollectorMcpSession | null> {
  const dbCount = await db.mcpServerConfig.count({ where: { enabled: true } })
  if (dbCount > 0) {
    return createCollectorMcpSessionFromDatabase()
  }
  return createCollectorMcpSessionFromEnv()
}
