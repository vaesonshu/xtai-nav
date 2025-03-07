'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useChat } from 'ai/react'

import avatar from '@/images/logo2.png'

export function AIChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  // 使用 AI SDK 的 useChat hook 处理聊天功能
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: '/api/chat',
      onResponse: () => {
        setIsTyping(false)
      },
      onError: (error) => {
        console.error('Chat error:', error)
      },
    })

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 处理表单提交
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    setIsTyping(true)
    handleSubmit(e)
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!input.trim() || isLoading) return
      setIsTyping(true)
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 py-4">
          {messages.length === 0 && (
            <div className="flex animate-fade-in justify-start">
              <div className="flex max-w-[85%] items-start gap-3">
                <Avatar className="h-8 w-8 border-2 border-purple-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="AI"
                  />
                  <AvatarFallback className="text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm shadow-sm dark:bg-gray-800">
                  <p className="leading-relaxed">
                    你好！我是 AI 星途导航助手，有什么我可以帮助你的吗？
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'flex animate-fade-in',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex max-w-[85%] items-start gap-3">
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border-2 border-purple-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                    <AvatarImage src="" alt="AI" />
                    <AvatarFallback className="text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  {/* {message.reasoning && (
                    <div className="mb-2 rounded bg-gray-200/50 p-2 text-xs font-mono dark:bg-gray-700/50">
                      <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {message.reasoning}
                      </p>
                    </div>
                  )} */}
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="User"
                    />
                    <AvatarFallback className="text-white">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex animate-fade-in justify-start">
              <div className="flex max-w-[85%] items-start gap-3">
                <Avatar className="h-8 w-8 border-2 border-purple-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                  <AvatarFallback className="text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
                      style={{ animationDelay: '200ms' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
                      style={{ animationDelay: '400ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <div className="flex">
                <div className="text-sm text-red-700 dark:text-red-400">
                  <p>出错了：{error.message || '与 AI 服务通信时发生错误'}</p>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t pt-4">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-2">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题..."
              className="min-h-[80px] resize-none rounded-xl border-gray-200 bg-gray-50 shadow-sm focus-visible:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-0 shadow-md transition-all hover:shadow-lg"
              size="icon"
            >
              <Send className="h-4 w-4 text-white" />
              <span className="sr-only">发送</span>
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
            <Sparkles className="h-3 w-3" />
            <span>AI 星途导航助手由 DeepSeek 模型提供支持</span>
          </div>
        </form>
      </div>
    </div>
  )
}
