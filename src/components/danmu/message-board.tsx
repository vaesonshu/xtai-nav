'use client'

import { useState, useRef } from 'react'
import MessageForm from './message-form'
import Danmaku from './danmaku'
import UserCounter from './user-counter'
import TestDanmaku from './test-danmaku'
import type { Message } from '@/types/message'

export default function MessageBoard() {
  const displayAreaRef = useRef<HTMLDivElement>(null)
  const [showTestDanmaku, setShowTestDanmaku] = useState(false)

  const addMessage = async (message: Omit<Message, 'id' | 'timestamp'>) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 用户计数器 */}
      <div className="absolute top-4 right-4 z-20">
        <UserCounter />
      </div>

      {/* 弹幕显示区域 */}
      <div
        ref={displayAreaRef}
        className="flex-grow relative bg-white/50 rounded-lg shadow-inner overflow-hidden mb-4"
        style={{ minHeight: 'calc(100vh - 220px)' }}
      >
        <Danmaku containerRef={displayAreaRef} />
        {/* {showTestDanmaku && <TestDanmaku />} */}

        {/* 提示文字和测试按钮 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-slate-400 text-lg opacity-30 mb-4">弹幕显示区域</p>
          {/* <button
            onClick={() => setShowTestDanmaku(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded pointer-events-auto"
          >
            发送测试弹幕
          </button> */}
        </div>
      </div>

      {/* 底部输入表单 */}
      <div className="fixed bottom-0 w-full">
        <MessageForm onSubmit={addMessage} />
      </div>
    </div>
  )
}
