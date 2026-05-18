'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Plug,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  Pencil,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

/** API 返回的 MCP 配置（与 Prisma 字段一致） */
export type McpServerRow = {
  id: string
  name: string
  enabled: boolean
  transport: string
  sortOrder: number
  stdioCommand: string | null
  stdioArgs: unknown
  stdioCwd: string | null
  streamUrl: string | null
  headersJson: unknown
  elicitationEnabled: boolean
  createdAt: string
  updatedAt: string
}

const SAMPLE_JSON = `{
  "mcpServers": {
    "bing-search": {
      "command": "npx",
      "args": ["-y", "bing-cn-mcp"]
    }
  }
}`

export default function McpServerManage() {
  const [servers, setServers] = useState<McpServerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<McpServerRow | null>(null)
  const [saving, setSaving] = useState(false)

  // 表单字段（新建 / 编辑）
  const [name, setName] = useState('')
  const [transport, setTransport] = useState<'stdio' | 'http' | 'sse'>('http')
  const [streamUrl, setStreamUrl] = useState('')
  const [stdioCommand, setStdioCommand] = useState('')
  const [stdioArgsText, setStdioArgsText] = useState('[]')
  const [stdioCwd, setStdioCwd] = useState('')
  const [headersText, setHeadersText] = useState('{}')
  const [sortOrder, setSortOrder] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [elicitationEnabled, setElicitationEnabled] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/mcp-servers')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '加载失败')
      setServers(data.servers ?? [])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setTransport('http')
    setStreamUrl('')
    setStdioCommand('')
    setStdioArgsText('[]')
    setStdioCwd('')
    setHeadersText('{}')
    setSortOrder(0)
    setEnabled(true)
    setElicitationEnabled(false)
    setDialogOpen(true)
  }

  const openEdit = (row: McpServerRow) => {
    setEditing(row)
    setName(row.name)
    setTransport(row.transport as 'stdio' | 'http' | 'sse')
    setStreamUrl(row.streamUrl ?? '')
    setStdioCommand(row.stdioCommand ?? '')
    setStdioArgsText(
      Array.isArray(row.stdioArgs) ? JSON.stringify(row.stdioArgs) : '[]'
    )
    setStdioCwd(row.stdioCwd ?? '')
    setHeadersText(
      row.headersJson &&
        typeof row.headersJson === 'object' &&
        !Array.isArray(row.headersJson)
        ? JSON.stringify(row.headersJson)
        : '{}'
    )
    setSortOrder(row.sortOrder)
    setEnabled(row.enabled)
    setElicitationEnabled(row.elicitationEnabled)
    setDialogOpen(true)
  }

  const parseJsonField = (
    text: string,
    label: string
  ): Record<string, string> | string[] => {
    try {
      return JSON.parse(text) as Record<string, string> | string[]
    } catch {
      throw new Error(`${label} 不是合法 JSON`)
    }
  }

  const submitForm = async () => {
    let stdioArgs: string[] | null = null
    let headersJson: Record<string, string> | null = null
    try {
      if (transport === 'stdio') {
        const a = parseJsonField(stdioArgsText, '参数列表 stdioArgs')
        if (!Array.isArray(a) || !a.every((x) => typeof x === 'string')) {
          throw new Error('stdioArgs 须为字符串数组 JSON')
        }
        stdioArgs = a
      }
      const h = parseJsonField(headersText, '请求头 headersJson')
      if (!h || typeof h !== 'object' || Array.isArray(h)) {
        throw new Error('headersJson 须为 JSON 对象')
      }
      for (const v of Object.values(h)) {
        if (typeof v !== 'string') throw new Error('headers 的值须为字符串')
      }
      headersJson =
        Object.keys(h).length > 0 ? (h as Record<string, string>) : null
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '格式错误')
      return
    }

    const body = {
      name: name.trim(),
      enabled,
      transport,
      sortOrder,
      stdioCommand: transport === 'stdio' ? stdioCommand.trim() : null,
      stdioArgs: transport === 'stdio' ? stdioArgs : null,
      stdioCwd: stdioCwd.trim() || null,
      streamUrl: transport !== 'stdio' ? streamUrl.trim() : null,
      headersJson,
      elicitationEnabled,
    }

    setSaving(true)
    try {
      const url = editing
        ? `/api/mcp-servers/${editing.id}`
        : '/api/mcp-servers'
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '保存失败')
      }
      toast.success(editing ? '已更新' : '已添加')
      setDialogOpen(false)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const toggleEnabled = async (row: McpServerRow) => {
    try {
      const res = await fetch(`/api/mcp-servers/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !row.enabled }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '更新失败')
      toast.success(row.enabled ? '已禁用' : '已启用')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '更新失败')
    }
  }

  const remove = async (row: McpServerRow) => {
    if (!confirm(`确定删除「${row.name}」？`)) return
    try {
      const res = await fetch(`/api/mcp-servers/${row.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '删除失败')
      toast.success('已删除')
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '删除失败')
    }
  }

  const onImportFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text) as unknown
      const res = await fetch('/api/mcp-servers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '导入失败')
      toast.success(`已导入 ${data.created ?? 0} 条`)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '导入失败')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plug className="h-5 w-5 text-violet-600" />
            MCP 服务（网站搜集 Agent）
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              新建
            </Button>
            <input
              id="mcp-json-upload"
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                void onImportFile(e.target.files?.[0] ?? null)
                e.target.value = ''
              }}
            />
            <Button variant="secondary" size="sm" asChild>
              <label htmlFor="mcp-json-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-1" />
                上传 JSON
              </label>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            配置存入数据库后，「AI 网站搜集」会加载所有<strong>已启用</strong>
            项（按排序合并工具）；无启用项时才使用环境变量{' '}
            <code className="text-xs bg-muted px-1 rounded">
              WEBSITE_COLLECTOR_MCP_*
            </code>
            。
          </p>
          <p>
            导入 JSON 支持：<strong>Cursor mcp.json</strong>（
            <code className="text-xs bg-muted px-1 rounded">mcpServers</code>
            ）；也可省略外壳，根对象直接为多个「服务 id → command/args」。无{' '}
            <code className="text-xs bg-muted px-1 rounded">transport</code>
            字段即按 stdio 处理。下方为可复制的示例。
          </p>
          <p>
            <strong>stdio</strong>：本地子进程（部署环境需有对应二进制/脚本）。
            <strong> http</strong>：AI SDK Streamable HTTP；<strong>sse</strong>
            ： Server-Sent Events。详见{' '}
            <a
              className="text-violet-600 underline"
              href="https://ai-sdk.dev/cookbook/next/mcp-tools"
              target="_blank"
              rel="noopener noreferrer"
            >
              MCP Tools
            </a>
            。
          </p>
          <Textarea
            readOnly
            className="font-mono text-xs min-h-[120px] bg-muted/30"
            value={SAMPLE_JSON}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">已配置列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              加载中…
            </div>
          ) : servers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无配置，请新建或上传 JSON。
            </p>
          ) : (
            <ul className="space-y-3">
              {servers.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium truncate">{s.name}</span>
                      <Badge variant={s.enabled ? 'default' : 'secondary'}>
                        {s.enabled ? '已启用' : '已禁用'}
                      </Badge>
                      <Badge variant="outline">{s.transport}</Badge>
                      <span className="text-xs text-muted-foreground">
                        sort:{s.sortOrder}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.transport === 'stdio'
                        ? `${s.stdioCommand} ${Array.isArray(s.stdioArgs) ? (s.stdioArgs as string[]).join(' ') : ''}`
                        : (s.streamUrl ?? '')}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.enabled}
                        onCheckedChange={() => void toggleEnabled(s)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEdit(s)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600"
                      onClick={() => void remove(s)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑 MCP' : '新建 MCP'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>名称</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：本地搜索 MCP"
              />
            </div>
            <div>
              <Label>传输方式</Label>
              <Select
                value={transport}
                onValueChange={(v) =>
                  setTransport(v as 'stdio' | 'http' | 'sse')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">http（Streamable HTTP）</SelectItem>
                  <SelectItem value="sse">sse（SSE）</SelectItem>
                  <SelectItem value="stdio">stdio（子进程）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {transport !== 'stdio' ? (
              <div>
                <Label>流式 URL</Label>
                <Input
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://example.com/mcp 或 /sse 端点"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label>命令</Label>
                  <Input
                    value={stdioCommand}
                    onChange={(e) => setStdioCommand(e.target.value)}
                    placeholder="node"
                  />
                </div>
                <div>
                  <Label>参数（JSON 字符串数组）</Label>
                  <Textarea
                    className="font-mono text-xs"
                    value={stdioArgsText}
                    onChange={(e) => setStdioArgsText(e.target.value)}
                  />
                </div>
                <div>
                  <Label>工作目录（可选）</Label>
                  <Input
                    value={stdioCwd}
                    onChange={(e) => setStdioCwd(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <Label>HTTP 请求头（JSON 对象，可选）</Label>
              <Textarea
                className="font-mono text-xs"
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                placeholder='{"Authorization":"Bearer ..."}'
              />
            </div>
            <div>
              <Label>排序（越小越先合并）</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={enabled} onCheckedChange={setEnabled} />
              <Label className="!mt-0">启用</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={elicitationEnabled}
                onCheckedChange={setElicitationEnabled}
              />
              <Label className="!mt-0">
                声明支持 Elicitation（管理端暂 decline）
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button disabled={saving} onClick={() => void submitForm()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
