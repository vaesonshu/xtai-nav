'use client'

import { useCallback, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Loader2, Search, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { WebsiteSearchUIMessage } from '@/lib/agents/website-search-agent'
import MarkdownContent from '@/components/message-board/markdown-content'

/**
 * 管理端「AI 站内搜索」对话区（与搜集助手相同采用 AI SDK v6：useChat + DefaultChatTransport）
 */
export default function WebsiteSearchAssistant() {
  const [inputValue, setInputValue] = useState('')

  const { messages, sendMessage, status, error } =
    useChat<WebsiteSearchUIMessage>({
      transport: new DefaultChatTransport({
        api: '/api/agent/search',
      }),
    })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInputValue('')
  }, [inputValue, isLoading, sendMessage])

  return (
    <Card className="flex flex-col border-gray-200 shadow-sm min-h-[560px]">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-teal-600" />
          AI 站内搜索
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          支持站内库检索 + 必应外网摘要（需配置{' '}
          <code className="text-xs bg-muted px-1 rounded">
            BING_SEARCH_API_KEY
          </code>
          ）。可尝试：先查库再联网，或先{' '}
          <code className="text-xs">loadSkill</code> 加载专项说明。
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-4 pt-3 min-h-0">
        <ScrollArea className="flex-1 pr-3 min-h-[400px] max-h-[480px]">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex gap-3 text-sm text-muted-foreground">
                <Bot className="h-8 w-8 shrink-0 text-teal-500" />
                <p>
                  我会调用数据库工具检索站点（可按关键词、分类、标签筛选），并对结果做中文摘要。
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
                    <Bot className="h-6 w-6 shrink-0 text-teal-500 mt-0.5" />
                  )}
                  <div
                    className={cn(
                      'rounded-xl px-3 py-2 max-w-[90%]',
                      message.role === 'user'
                        ? 'bg-teal-600 text-white whitespace-pre-wrap'
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
                Agent 正在检索…
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
            placeholder="输入要查询的内容…"
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
  )
}
