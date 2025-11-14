'use client'

import { useState, useEffect, useCallback } from 'react'
import { WebsiteCard } from '@/components/website-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2, ArrowUp } from 'lucide-react'
import { WebsiteWithCategories } from '@/lib/data'

interface WebsiteListProps {
  search?: string
  category?: string
  initialPage?: number
  pageSize?: number
}

interface PaginationData {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function WebsiteList({
  search = '',
  category = '',
  initialPage = 1,
  pageSize = 12,
}: WebsiteListProps) {
  const [websites, setWebsites] = useState<WebsiteWithCategories[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const loadWebsites = useCallback(
    async (page: number) => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          search,
          category,
          page: page.toString(),
          pageSize: pageSize.toString(),
        })
        const response = await fetch(`/api/websites?${params}`)
        const result = await response.json()
        setWebsites(result.websites)
        setPagination(result.pagination)
      } catch (error) {
        console.error('Failed to load websites:', error)
      } finally {
        setLoading(false)
      }
    },
    [search, category, pageSize]
  )

  useEffect(() => {
    loadWebsites(currentPage)
  }, [currentPage, loadWebsites])

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && websites.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">加载中...</span>
      </div>
    )
  }

  if (websites.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
          <div>
            找到{' '}
            <span className="font-semibold text-gray-900">
              {pagination.total}
            </span>{' '}
            个网站
            {pagination.totalPages > 1 && (
              <span className="ml-2">
                (第 {currentPage} 页，共 {pagination.totalPages} 页)
              </span>
            )}
          </div>
          <div className="text-xs">每页显示 {pageSize} 个</div>
        </div>
      )}

      {/* Scrollable Website Grid Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="grid gap-4 grid-cols-1">
            {websites.map((website) => (
              <div
                key={website.id}
                className="transform transition-all duration-200 hover:shadow-lg"
              >
                <WebsiteCard website={website} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination inside the container */}
        {pagination && pagination.totalPages > 1 && (
          <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                显示第 {(currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, pagination.total)} 项， 共{' '}
                {pagination.total} 项
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="h-9 px-3 hover:bg-white hover:border-gray-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  上一页
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className={`h-9 w-9 p-0 transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                              : 'hover:bg-white hover:border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      )
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || loading}
                  className="h-9 px-3 hover:bg-white hover:border-gray-300"
                >
                  下一页
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-300 z-40"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
          <span className="sr-only">回到顶部</span>
        </Button>
      )}

      {/* Loading overlay for page changes */}
      {loading && websites.length > 0 && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center space-x-3 border border-gray-100">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-6 w-6 animate-ping rounded-full bg-blue-600/20"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">加载中...</span>
          </div>
        </div>
      )}
    </div>
  )
}
