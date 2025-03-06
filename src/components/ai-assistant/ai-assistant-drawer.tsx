'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AIChat } from './ai-chat'
import { Bot, Stars } from 'lucide-react'

interface AIAssistantDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIAssistantDrawer({
  open,
  onOpenChange,
}: AIAssistantDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-l-indigo-200 bg-gradient-to-b from-white to-gray-50 p-0 sm:max-w-md md:max-w-lg dark:from-gray-900 dark:to-gray-950">
        <SheetHeader className="border-b bg-white/80 p-4 backdrop-blur-sm dark:bg-gray-900/80">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span>AI 星途导航助手</span>
            <Stars className="ml-1 h-4 w-4 text-yellow-500" />
          </SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <AIChat />
        </div>
      </SheetContent>
    </Sheet>
  )
}
