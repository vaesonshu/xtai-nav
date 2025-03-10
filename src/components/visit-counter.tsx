'use client'

import { useEffect, useState } from 'react'
import { incrementVisitCount } from '@/lib/visit-actions'
import { Eye, Clock } from 'lucide-react'

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
        // Only increment on first load
        const visitStats = await incrementVisitCount()
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
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <div className="flex items-center">
        <Eye className="h-3.5 w-3.5 mr-1 opacity-70" />
        <span>
          {loading ? (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-transparent animate-spin"></span>
          ) : (
            <span>{stats.uniqueVisitors.toLocaleString()} 位访客</span>
          )}
        </span>
      </div>
      <span className="mx-2">|</span>
      <div className="flex items-center">
        <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
        <span>{currentTime}</span>
      </div>
    </div>
  )
}
