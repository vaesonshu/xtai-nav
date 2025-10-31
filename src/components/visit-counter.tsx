'use client'

import { useEffect, useState } from 'react'
import { incrementVisitCount } from '@/lib/visit-actions'
import { Eye, Clock, Users } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export default function VisitCounter() {
  const [stats, setStats] = useState<{
    totalVisits: number
    uniqueVisitors: number
  }>({
    totalVisits: 0,
    uniqueVisitors: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const trackVisit = async () => {
      try {
        setLoading(true)

        // 生成或获取session ID
        let sessionId = localStorage.getItem('visit-session-id')
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          localStorage.setItem('visit-session-id', sessionId)
        }

        // 发送包含session ID的请求
        const response = await fetch('/api/visit', {
          method: 'POST',
          headers: {
            'x-session-id': sessionId,
          },
        })
        const visitStats = await response.json()
        setStats(visitStats)
      } catch (error) {
        console.error('Failed to track visit:', error)
      } finally {
        setLoading(false)
      }
    }

    trackVisit()

    // Update time every second
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      setCurrentTime(timeString)
    }

    // Set initial time
    updateTime()

    // Update time every second
    const timeInterval = setInterval(updateTime, 1000)

    // Clean up interval on unmount
    return () => clearInterval(timeInterval)
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
      <div className="flex items-center">
        <Users className="h-3.5 w-3.5 mr-1 opacity-70" />
        <span className="inline-block text-center">
          {loading ? (
            <Spinner />
          ) : (
            <span>{stats.uniqueVisitors.toLocaleString()} 位访客</span>
          )}
        </span>
      </div>
      <span className="mx-1">|</span>
      <div className="flex items-center">
        <Eye className="h-3.5 w-3.5 mr-1 opacity-70" />
        <span>
          {loading ? (
            <Spinner />
          ) : (
            <span>{stats.totalVisits.toLocaleString()} 次访问</span>
          )}
        </span>
      </div>
      <span className="mx-1 hidden sm:inline">|</span>
      <div className="hidden sm:flex items-center">
        <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
        <span>{currentTime}</span>
      </div>
    </div>
  )
}
