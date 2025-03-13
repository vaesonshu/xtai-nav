// src/components/ui/tooltip-wrapper.tsx
'use client'

import React from 'react'
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip' // 假设这是你的 shadcn/ui 路径

interface TooltipWrapperProps {
  children: React.ReactNode // 触发器内容
  content: React.ReactNode // 提示内容
  side?: 'top' | 'right' | 'bottom' | 'left' // 提示位置
  align?: 'start' | 'center' | 'end' // 对齐方式
  delayDuration?: number // 延迟显示时间（毫秒）
  className?: string // 自定义 TooltipContent 的类名
  asChild?: boolean // 是否作为子元素渲染触发器
}

export function TooltipWrapper({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
  asChild = true,
}: TooltipWrapperProps) {
  return (
    <TooltipProvider>
      <ShadcnTooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          {content}
        </TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  )
}

// 示例用法组件
export function TooltipDemo() {
  return (
    <div className="flex items-center justify-center p-4">
      <TooltipWrapper
        content={<p>这是一个提示信息</p>}
        side="right"
        align="start"
        delayDuration={500}
        className="bg-gray-800 text-white"
      >
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          悬停我
        </button>
      </TooltipWrapper>
    </div>
  )
}
