import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { getCurrentUserId } from '@/lib/auth-client'
import { isAdmin } from '@/lib/utils'
import { db } from '@/db/db'
import { mcpServerCreateSchema } from '@/lib/mcp/mcp-server-api-schema'
import { parseMcpImportPayload } from '@/lib/mcp/mcp-import-parse'

async function guardAdmin() {
  const userId = await getCurrentUserId()
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }
  return null
}

/**
 * POST：批量导入 MCP 配置（请求体为 JSON 文件内容）
 * 支持 servers 数组、Cursor mcpServers、或服务名→{ command, args } 简写。
 */
export async function POST(req: Request) {
  const denied = await guardAdmin()
  if (denied) return denied

  try {
    const body = await req.json()
    let rawList: z.infer<typeof mcpServerCreateSchema>[]
    try {
      rawList = parseMcpImportPayload(body)
    } catch (e) {
      const msg = e instanceof Error ? e.message : '解析失败'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const created: Awaited<ReturnType<typeof db.mcpServerConfig.create>>[] = []

    for (const d of rawList) {
      const row = await db.mcpServerConfig.create({
        data: {
          name: d.name,
          enabled: d.enabled,
          transport: d.transport,
          sortOrder: d.sortOrder,
          stdioCommand: d.transport === 'stdio' ? d.stdioCommand!.trim() : null,
          stdioArgs:
            d.transport === 'stdio'
              ? ((d.stdioArgs ?? []) as Prisma.InputJsonValue)
              : Prisma.JsonNull,
          stdioCwd: d.stdioCwd?.trim() || null,
          streamUrl: d.transport !== 'stdio' ? d.streamUrl!.trim() : null,
          headersJson:
            d.headersJson && Object.keys(d.headersJson).length > 0
              ? d.headersJson
              : Prisma.JsonNull,
          elicitationEnabled: d.elicitationEnabled,
        },
      })
      created.push(row)
    }

    return NextResponse.json({
      created: created.length,
      servers: created,
    })
  } catch (e) {
    console.error('mcp-servers/import', e)
    return NextResponse.json({ error: '导入失败' }, { status: 500 })
  }
}
