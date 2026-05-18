import type { z } from 'zod'
import { mcpServerCreateSchema } from '@/lib/mcp/mcp-server-api-schema'

type McpCreate = z.infer<typeof mcpServerCreateSchema>

/**
 * Cursor / VS Code 常见写法：仅有 command + args，无 transport 字段 → 视为 stdio
 */
function isCommandArgsStdioShorthand(
  val: unknown
): val is { command: string; args?: unknown; cwd?: unknown } {
  if (val === null || typeof val !== 'object' || Array.isArray(val))
    return false
  const o = val as Record<string, unknown>
  return typeof o.command === 'string' && !('transport' in o)
}

function normalizeStdioShorthand(
  key: string,
  val: { command: string; args?: unknown; cwd?: unknown },
  sortOrder: number
): McpCreate {
  const args = Array.isArray(val.args)
    ? val.args.filter((x): x is string => typeof x === 'string')
    : []
  const cwd =
    typeof val.cwd === 'string' && val.cwd.trim() ? val.cwd.trim() : null
  const raw = {
    name: key.slice(0, 120),
    transport: 'stdio' as const,
    stdioCommand: val.command.trim(),
    stdioArgs: args,
    stdioCwd: cwd,
    enabled: true as const,
    sortOrder,
    streamUrl: null as string | null,
    headersJson: null as Record<string, string> | null,
    elicitationEnabled: false as const,
  }
  const v = mcpServerCreateSchema.safeParse(raw)
  if (!v.success) {
    throw new Error(`「${key}」: ${v.error.message}`)
  }
  return v.data
}

/**
 * 形如 { "bing-search": { "command": "npx", "args": ["-y", "bing-cn-mcp"] } }
 * 或包一层 { "mcpServers": { ... } }
 */
function parseServerMap(body: Record<string, unknown>): McpCreate[] {
  const out: McpCreate[] = []
  let i = 0
  for (const [key, val] of Object.entries(body)) {
    if (key === 'mcpServers' || key === 'servers') continue
    if (isCommandArgsStdioShorthand(val)) {
      out.push(normalizeStdioShorthand(key, val, i))
      i++
      continue
    }
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const o = val as Record<string, unknown>
      const merged = {
        ...o,
        name:
          typeof o.name === 'string' && o.name.trim()
            ? o.name.trim()
            : key.slice(0, 120),
      }
      const v = mcpServerCreateSchema.safeParse(merged)
      if (!v.success) {
        throw new Error(
          `「${key}」: ${v.error.message}（stdio 简写请用 command + args，完整格式请含 transport）`
        )
      }
      out.push(v.data)
      i++
      continue
    }
    throw new Error(`「${key}」不是合法的对象`)
  }
  return out
}

/**
 * 导入 JSON → 多条 McpCreate。支持：
 * - `{ "servers": [ ... ] }`
 * - 单条完整：`{ "name", "transport", ... }`
 * - `{ "mcpServers": { "id": { "command", "args" } } }`（Cursor mcp.json）
 * - `{ "bing-search": { "command": "npx", "args": ["-y", "bing-cn-mcp"] } }`
 */
export function parseMcpImportPayload(body: unknown): McpCreate[] {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('根节点须为 JSON 对象')
  }

  const root = body as Record<string, unknown>

  // Cursor：顶层 mcpServers
  if (
    'mcpServers' in root &&
    root.mcpServers !== null &&
    typeof root.mcpServers === 'object' &&
    !Array.isArray(root.mcpServers)
  ) {
    const list = parseServerMap(root.mcpServers as Record<string, unknown>)
    if (list.length > 0) return list
  }

  if ('servers' in root && Array.isArray(root.servers)) {
    const arr = root.servers as unknown[]
    return arr.map((item, idx) => {
      const v = mcpServerCreateSchema.safeParse(item)
      if (!v.success) {
        throw new Error(`servers[${idx}]: ${v.error.message}`)
      }
      return v.data
    })
  }

  // 单条完整配置（带 name）
  if ('name' in root && typeof root.name === 'string' && 'transport' in root) {
    const v = mcpServerCreateSchema.safeParse(root)
    if (!v.success) {
      throw new Error(v.error.message)
    }
    return [v.data]
  }

  // 多服务 Map（键为展示名 / id）
  const mapList = parseServerMap(root)
  if (mapList.length > 0) return mapList

  throw new Error(
    '无法解析：请使用 servers 数组、mcpServers 对象或服务名→command 的对象'
  )
}
