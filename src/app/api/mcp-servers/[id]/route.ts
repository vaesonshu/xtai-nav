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

type RouteCtx = { params: Promise<{ id: string }> }

/** PATCH：更新；合并后整体验证，避免半套字段 */
export async function PATCH(req: Request, ctx: RouteCtx) {
  const denied = await guardAdmin()
  if (denied) return denied

  const { id } = await ctx.params
  const existing = await db.mcpServerConfig.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: '未找到' }, { status: 404 })
  }

  try {
    const patch = await req.json()
    const merged = {
      name: patch.name ?? existing.name,
      enabled: patch.enabled ?? existing.enabled,
      transport: (patch.transport ?? existing.transport) as
        | 'stdio'
        | 'http'
        | 'sse',
      sortOrder: patch.sortOrder ?? existing.sortOrder,
      stdioCommand:
        patch.stdioCommand !== undefined
          ? patch.stdioCommand
          : existing.stdioCommand,
      stdioArgs:
        patch.stdioArgs !== undefined ? patch.stdioArgs : existing.stdioArgs,
      stdioCwd:
        patch.stdioCwd !== undefined ? patch.stdioCwd : existing.stdioCwd,
      streamUrl:
        patch.streamUrl !== undefined ? patch.streamUrl : existing.streamUrl,
      headersJson:
        patch.headersJson !== undefined
          ? patch.headersJson
          : existing.headersJson,
      elicitationEnabled:
        patch.elicitationEnabled ?? existing.elicitationEnabled,
    }

    const normalized = {
      name: merged.name,
      enabled: merged.enabled,
      transport: merged.transport,
      sortOrder: merged.sortOrder,
      stdioCommand: merged.stdioCommand,
      stdioArgs: merged.stdioArgs as string[] | null | undefined,
      stdioCwd: merged.stdioCwd,
      streamUrl: merged.streamUrl,
      headersJson:
        merged.headersJson && typeof merged.headersJson === 'object'
          ? (merged.headersJson as Record<string, string>)
          : null,
      elicitationEnabled: merged.elicitationEnabled,
    }

    const parsed = mcpServerCreateSchema.safeParse({
      ...normalized,
      stdioArgs: Array.isArray(normalized.stdioArgs)
        ? normalized.stdioArgs
        : [],
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: '合并后参数无效', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const d = parsed.data
    const row = await db.mcpServerConfig.update({
      where: { id },
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
    console.error('mcp-servers PATCH', e)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const denied = await guardAdmin()
  if (denied) return denied

  const { id } = await ctx.params
  try {
    await db.mcpServerConfig.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '删除失败' }, { status: 404 })
  }
}
