'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Loader2, Send, Sparkles, Globe, Import } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type {
  CollectedWebsite,
  WebsiteCollectorUIMessage,
} from '@/lib/agents/website-collector-agent'
import { batchAdminCreateWebsites } from '@/lib/actions'
import { buildFaviconFallbackUrls } from '@/lib/favicon-resolve'
import { toast } from 'sonner'
import MarkdownContent from '@/components/message-board/markdown-content'

/** 列表中的站点图标：多 URL 回退，全部失败则显示占位 */
function SiteFavicon({ site }: { site: CollectedWebsite }) {
  const candidates = useMemo(
    () => buildFaviconFallbackUrls(site.url, site.iconUrl),
    [site.url, site.iconUrl]
  )
  const [idx, setIdx] = useState(0)
  const [broke, setBroke] = useState(false)

  useEffect(() => {
    setIdx(0)
    setBroke(false)
  }, [site.url, site.iconUrl])

  if (broke || candidates.length === 0) {
    return <Globe className="h-5 w-5 shrink-0 text-muted-foreground" />
  }

  const src = candidates[Math.min(idx, candidates.length - 1)]
  return (
    <img
      src={src}
      alt=""
      className="h-5 w-5 shrink-0 rounded"
      onError={() => {
        if (idx >= candidates.length - 1) setBroke(true)
        else setIdx((i) => i + 1)
      }}
    />
  )
}

// 从 UIMessage parts 解析 reportWebsiteCandidates 结果（AI SDK v6: type 为 tool-{toolName}）
function extractCandidates(
  messages: WebsiteCollectorUIMessage[]
): CollectedWebsite[] {
  const map = new Map<string, CollectedWebsite>()

  for (const msg of messages) {
    if (msg.role !== 'assistant' || !msg.parts) continue
    for (const part of msg.parts) {
      // 官方格式：静态工具 part 名为 tool-reportWebsiteCandidates，完成后 state 为 output-available
      if (part.type !== 'tool-reportWebsiteCandidates') continue
      if (part.state !== 'output-available') continue

      const output = part.output as { websites?: CollectedWebsite[] }
      if (!Array.isArray(output?.websites)) continue

      for (const w of output.websites) {
        if (w?.url) map.set(w.url, w)
      }
    }
  }

  return Array.from(map.values())
}

export default function WebsiteCollector() {
  const [inputValue, setInputValue] = useState('')
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)

  const { messages, sendMessage, status, error } =
    useChat<WebsiteCollectorUIMessage>({
      transport: new DefaultChatTransport({
        api: '/api/agent/collect',
      }),
    })

  const candidates = useMemo(() => extractCandidates(messages), [messages])

  const isLoading = status === 'streaming' || status === 'submitted'

  const toggleSelect = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const selectAll = () => {
    setSelectedUrls(new Set(candidates.map((c) => c.url)))
  }

  const clearSelection = () => setSelectedUrls(new Set())

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInputValue('')
  }, [inputValue, isLoading, sendMessage])

  const handleImport = async () => {
    const toImport = candidates.filter((c) => selectedUrls.has(c.url))
    if (toImport.length === 0) {
      toast.error('请先勾选要入库的网站')
      return
    }

    setImporting(true)
    try {
      const res = await batchAdminCreateWebsites(
        toImport.map((c) => {
          const iconUrl =
            c.iconUrl?.trim() || buildFaviconFallbackUrls(c.url)[0] || ''
          return {
            name: c.name,
            url: c.url,
            iconUrl,
            description: c.description,
            tags: c.tags,
            categoryIds: c.categoryIds,
          }
        })
      )

      if (res.success) {
        toast.success(res.message ?? '入库完成')
        clearSelection()
      } else {
        toast.error(res.message ?? '入库失败')
      }

      const failed = res.results?.filter((r) => !r.success) ?? []
      if (failed.length > 0) {
        failed.forEach((f) => toast.error(`${f.name}: ${f.message ?? '失败'}`))
      }
    } catch (e) {
      toast.error('入库请求失败')
      console.error(e)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
      <Card className="flex flex-col border-gray-200 shadow-sm min-h-[560px]">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            AI 搜集对话
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            描述主题即可。也可在{' '}
            <a
              href="/admin?page=mcp-servers"
              className="text-indigo-600 underline underline-offset-2"
            >
              MCP 配置
            </a>{' '}
            中接入 stdio / 流式 HTTP·SSE
            工具增强搜集；最终仍以右侧候选列表入库。
          </p>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-4 pt-3 min-h-0">
          <ScrollArea className="flex-1 pr-3 min-h-[360px] max-h-[420px]">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <Bot className="h-8 w-8 shrink-0 text-indigo-500" />
                  <p>
                    我会先查询你的分类目录，再推荐未收录的优质网站，整理后出现在右侧候选列表。
                  </p>
                </div>
              )}
              {messages.map((message) => {
                const text =
                  message.parts
                    ?.filter((p) => p.type === 'text')
                    .map((p) => (p.type === 'text' ? p.text : ''))
                    .join('') ?? ''
                return (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-2 text-sm',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <Bot className="h-6 w-6 shrink-0 text-indigo-500 mt-0.5" />
                    )}
                    <div
                      className={cn(
                        'rounded-xl px-3 py-2 max-w-[90%]',
                        message.role === 'user'
                          ? 'bg-indigo-600 text-white whitespace-pre-wrap'
                          : 'bg-gray-100 text-gray-900 dark:bg-muted dark:text-foreground'
                      )}
                    >
                      {message.role === 'assistant' ? (
                        <MarkdownContent
                          content={text}
                          className="prose-neutral dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-pre:my-2"
                        />
                      ) : (
                        text
                      )}
                    </div>
                  </div>
                )
              })}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agent 正在搜集…
                </div>
              )}
            </div>
          </ScrollArea>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {(error as Error).message || '请求失败'}
            </p>
          )}

          <div className="mt-4 flex gap-2 border-t pt-4">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入搜集主题或补充要求…"
              className="min-h-[72px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              className="shrink-0 h-10 w-10"
              disabled={!inputValue.trim() || isLoading}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col border-gray-200 shadow-sm min-h-[560px]">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-green-600" />
              候选网站
              {candidates.length > 0 && (
                <Badge variant="secondary">{candidates.length}</Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                全选
              </Button>
              <Button
                size="sm"
                disabled={selectedUrls.size === 0 || importing}
                onClick={handleImport}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Import className="h-4 w-4 mr-1" />
                )}
                入库 ({selectedUrls.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4 pt-3 min-h-0">
          <ScrollArea className="h-[480px] pr-3">
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                Agent 调用 reportWebsiteCandidates 后，候选网站会显示在这里
              </p>
            ) : (
              <ul className="space-y-3">
                {candidates.map((site) => (
                  <li
                    key={site.url}
                    className="flex gap-3 rounded-lg border p-3 hover:bg-gray-50/80"
                  >
                    <Checkbox
                      checked={selectedUrls.has(site.url)}
                      onCheckedChange={() => toggleSelect(site.url)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <SiteFavicon site={site} />
                        <span className="font-medium truncate">
                          {site.name}
                        </span>
                      </div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline truncate block"
                      >
                        {site.url}
                      </a>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {site.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {site.tags?.slice(0, 5).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
