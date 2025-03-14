'use client'

import type React from 'react'

import { useEffect, useState, useRef, useCallback } from 'react'
import { generateRandomColor, adminColor } from '@/lib/utils'

interface DanmakuProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

interface DanmakuItemData {
  id: string
  content: string
  author: string
  isAdmin: boolean
  top: number
  duration: number
  color: string
  backgroundColor: string
  fontSize: number
}

export default function Danmaku({ containerRef }: DanmakuProps) {
  const [danmakuItems, setDanmakuItems] = useState<DanmakuItemData[]>([])
  const [error, setError] = useState(false)
  const processedMessagesRef = useRef<Set<string>>(new Set())

  // 添加弹幕项
  const addDanmakuItem = useCallback(
    (message: any) => {
      if (!containerRef.current || !message) return

      const containerHeight = containerRef.current.clientHeight - 50

      // 随机生成弹幕位置和样式
      const top = Math.floor(Math.random() * containerHeight)
      const duration = Math.floor(Math.random() * 8) + 12 // 12-20秒
      const fontSize = Math.floor(Math.random() * 4) + 16 // 16-20px

      // 为站长和用户设置不同样式
      let color, backgroundColor

      if (message.isAdmin) {
        // 站长使用固定颜色
        color = adminColor.textColor
        backgroundColor = adminColor.backgroundColor
      } else {
        // 用户使用随机颜色
        const randomColor = generateRandomColor()
        color = randomColor.textColor
        backgroundColor = randomColor.backgroundColor
      }

      const newItem: DanmakuItemData = {
        id: message.id,
        content: message.content || '',
        author: message.author || '匿名',
        isAdmin: Boolean(message.isAdmin),
        top,
        duration,
        color,
        backgroundColor,
        fontSize,
      }

      // old
      // setDanmakuItems((prev) => [...prev, newItem])

      // // 弹幕播放完毕后移除
      // setTimeout(
      //   () => {
      //     setDanmakuItems((prev) =>
      //       prev.filter((item) => item.id !== newItem.id)
      //     )
      //   },
      //   duration * 1000 + 2000
      // ) // 额外添加2秒确保完全移出

      // new
      // 更新状态时过滤重复 id
      setDanmakuItems((prev) => {
        const filtered = prev.filter((item) => item.id !== newItem.id)
        return [...filtered, newItem]
      })
    },
    [containerRef]
  )

  // 初始化加载历史消息
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages')
        if (!response.ok) throw new Error('Failed to fetch messages')

        const messages = await response.json()

        if (
          Array.isArray(messages) &&
          messages.length > 0 &&
          containerRef.current
        ) {
          // 只显示最近的10条消息
          const recentMessages = messages.slice(0, 10)

          recentMessages.forEach((message: any, index: number) => {
            if (message && message.id) {
              setTimeout(() => {
                addDanmakuItem(message)
              }, index * 300) // 每300ms添加一条，避免同时出现太多
            }
          })
        }

        setError(false)
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        setError(true)
      }
    }

    fetchMessages()
  }, [containerRef, addDanmakuItem])

  // 监听实时消息
  useEffect(() => {
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource('/api/sse')

      eventSource.addEventListener('messages', (event) => {
        try {
          if (event.data) {
            const newMessages = JSON.parse(event.data)

            if (Array.isArray(newMessages)) {
              newMessages.forEach((message: any, index: number) => {
                // 避免重复处理同一条消息或无效消息
                if (
                  message &&
                  message.id &&
                  !processedMessagesRef.current.has(message.id)
                ) {
                  processedMessagesRef.current.add(message.id)

                  // 延迟添加，避免同时出现太多弹幕
                  setTimeout(() => {
                    addDanmakuItem(message)
                  }, index * 300)
                }
              })
            }
          }

          setError(false)
        } catch (error) {
          console.error('Error parsing new messages:', error)
          setError(true)
        }
      })

      eventSource.onerror = () => {
        console.error('SSE connection error')
        setError(true)
        if (eventSource) {
          eventSource.close()
        }
      }
    } catch (error) {
      console.error('Failed to create SSE connection:', error)
      setError(true)
    }

    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [addDanmakuItem])

  // 显示错误提示
  if (error) {
    return (
      <div className="absolute top-4 left-4 bg-red-100 text-red-800 px-3 py-1 rounded-full shadow-sm">
        连接错误，请刷新页面重试
      </div>
    )
  }

  return (
    <>
      {danmakuItems.map((item) => (
        <div
          key={item.id}
          className="danmaku-item px-3 py-1 rounded-full"
          style={{
            top: `${item.top}px`,
            color: item.color,
            backgroundColor: item.backgroundColor,
            fontSize: `${item.fontSize}px`,
            fontWeight: item.isAdmin ? 'bold' : 'normal',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            animationDuration: `${item.duration}s`,
            zIndex: 50,
          }}
        >
          {item.isAdmin ? `【站长】${item.author}: ` : `${item.author}: `}
          {item.content}
        </div>
      ))}
    </>
  )
}
