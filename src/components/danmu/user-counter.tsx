'use client'

import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'

export default function UserCounter() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    // 用户进入页面时增加计数
    const incrementCount = async () => {
      try {
        const response = await fetch('/api/user-count', { method: 'POST' })
        if (!response.ok) throw new Error('Failed to increment count')

        const data = await response.json()
        if (data && typeof data.count === 'number') {
          setCount(data.count)
        }
      } catch (error) {
        console.error('Failed to increment user count:', error)
        setError(true)
      }
    }

    incrementCount()

    // 监听SSE事件获取实时用户数
    let eventSource: EventSource | null = null

    try {
      eventSource = new EventSource('/api/sse')

      eventSource.addEventListener('userCount', (event) => {
        try {
          if (event.data) {
            const data = JSON.parse(event.data)
            if (data && typeof data.count === 'number') {
              setCount(data.count)
              setError(false)
            }
          }
        } catch (error) {
          console.error('Error parsing user count:', error)
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

    // 用户离开页面时减少计数
    return () => {
      if (eventSource) {
        eventSource.close()
      }

      fetch('/api/user-count', { method: 'DELETE' }).catch((error) => {
        console.error('Failed to decrement user count:', error)
      })
    }
  }, [])

  return (
    <div
      className={`flex items-center gap-1 ${error ? 'bg-red-100' : 'bg-white/80'} px-3 py-1 rounded-full shadow-sm`}
    >
      <Users size={16} className={error ? 'text-red-600' : 'text-indigo-600'} />
      <span
        className={`font-medium ${error ? 'text-red-800' : 'text-indigo-800'}`}
      >
        {error ? '连接错误' : `${count} 在线`}
      </span>
    </div>
  )
}
