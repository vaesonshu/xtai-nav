'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { House, Clock, User, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Log {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export default function LogsPage() {
  const { errorToast } = useToast()
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // 分页获取日志
  const fetchLogs = useCallback(
    async (page = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true)
        } else {
          setLoading(true)
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        })

        const response = await fetch(`/api/logs?${params}`)
        const data = await response.json()

        if (response.ok) {
          if (append) {
            setLogs((prev) => [...prev, ...data.logs])
          } else {
            setLogs(data.logs)
          }

          // 检查是否还有更多页面
          setHasMore(
            data.logs.length === 10 && data.pagination.totalPages > page
          )
        } else {
          errorToast('获取日志失败', { description: data.error })
        }
      } catch (error) {
        console.error('获取日志失败:', error)
        errorToast('获取日志失败', { description: '网络错误，请稍后重试' })
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [errorToast]
  )

  // 分页加载更多日志
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchLogs(nextPage, true)
    }
  }, [currentPage, loadingMore, hasMore, fetchLogs])

  // 分页滚动加载更多日志
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      // 防抖滚动事件
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000
        ) {
          loadMore()
        }
      }, 100)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [loadMore])

  useEffect(() => {
    // 初始化加载第一页日志
    fetchLogs(1, false)
  }, [fetchLogs])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      )
      return `${diffInMinutes}分钟前`
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                更新日志
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                查看系统运行日志记录。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href={'/'}>
                  <House className="mr-2 h-4 w-4" />
                  返回首页
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Logs Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">加载中...</p>
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">暂无日志记录</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-6">
                {logs.map((log) => (
                  <Card
                    key={log.id}
                    className={`hover:shadow-xl transition-all duration-300 relative ${
                      log.isPinned
                        ? 'border-l-4 border-l-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent shadow-lg ring-1 ring-blue-100/50'
                        : 'hover:shadow-lg border-border'
                    }`}
                  >
                    {log.isPinned && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium px-2 py-1 shadow-sm border border-blue-200"
                        >
                          📌 置顶
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="mb-3">
                            <h3
                              className={`font-bold text-xl ${
                                log.isPinned
                                  ? 'text-blue-900'
                                  : 'text-foreground'
                              }`}
                              title={log.title}
                            >
                              {log.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">
                              {formatTime(log.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="prose prose-sm max-w-none">
                        <p
                          className={`text-muted-foreground leading-relaxed whitespace-pre-wrap ${
                            log.isPinned ? 'text-foreground' : ''
                          }`}
                          title={log.content}
                        >
                          {log.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    加载更多日志...
                  </p>
                </div>
              )}

              {/* End of content indicator */}
              {!hasMore && logs.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    没有更多日志了
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
