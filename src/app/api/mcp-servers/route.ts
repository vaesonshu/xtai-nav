import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getCurrentUserId } from '@/lib/auth-client'
import { isAdmin } from '@/lib/utils'
import { db } from '@/db/db'
import { mcpServerCreateSchema } from '@/lib/mcp/mcp-server-api-schema'

async function guardAdmin() {
  const userId = await getCurrentUserId()
  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: '无权限' }, { status: 403 })
  }
  return null
}

/** GET：列出所有 MCP 配置（含禁用项，便于管理） */
export async function GET() {
  const denied = await guardAdmin()
  if (denied) return denied

  const servers = await db.mcpServerConfig.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  return NextResponse.json({ servers })
}

/** POST：新增一条 MCP 配置 */
export async function POST(req: Request) {
  const denied = await guardAdmin()
  if (denied) return denied

  try {
    const body = await req.json()
    const parsed = mcpServerCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数无效', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const d = parsed.data
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
    return NextResponse.json({ server: row })
  } catch (e) {
    console.error('mcp-servers POST', e)
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
