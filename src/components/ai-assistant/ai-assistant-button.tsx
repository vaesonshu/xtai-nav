'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIAssistantDrawer } from './ai-assistant-drawer'
import { cn } from '@/lib/utils'

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 定期触发动画效果
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setIsAnimating(true)

      // 动画持续时间后重置
      setTimeout(() => {
        setIsAnimating(false)
      }, 2500) // 延长动画持续时间
    }, 12000) // 每12秒触发一次动画

    return () => clearInterval(animationInterval)
  }, [])

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <div
          className={cn(
            'mb-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-2.5 text-white shadow-glow transition-all duration-500',
            isAnimating ? 'animate-float' : 'opacity-0',
            isAnimating
              ? 'translate-y-0 opacity-100'
              : 'translate-y-2 opacity-0'
          )}
        >
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Ask me</span>
          </div>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            'h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-0 shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-glow-intense',
            isAnimating && 'animate-pulse-subtle'
          )}
          size="icon"
        >
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-transparent">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="sr-only">打开 AI 助手</span>
        </Button>
      </div>
      <AIAssistantDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
