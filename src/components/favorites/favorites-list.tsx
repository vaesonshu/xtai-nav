'use client'

import { useState, useEffect } from 'react'
import { WebsiteCard } from '@/components/favorite-card'
import { EmptyFavorites } from '@/components/favorites/empty-favorites'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

interface WebsiteData {
  id: string
  name: string
  iconUrl: string
  description: string
  url: string
  categories: any[]
  tags: string[]
  likes: any[]
  createdAt: Date
}

interface FavoritesListProps {
  initialWebsites?: WebsiteData[]
  searchQuery?: string
  sortBy?: 'latest' | 'popular'
}

// Mock数据，用于演示
const mockWebsites: WebsiteData[] = [
  {
    id: '1',
    name: 'ChatGPT',
    iconUrl: 'https://example.com/chatgpt-icon.png',
    description:
      'OpenAI开发的强大对话式AI助手，能够回答问题、生成文本和提供帮助。',
    url: 'https://chat.openai.com',
    categories: [{ category: { name: 'AI助手' } }],
    tags: ['对话AI', '生成式AI', 'OpenAI'],
    likes: Array(1543).fill(null),
    createdAt: new Date('2023-11-15'),
  },
  {
    id: '2',
    name: 'Midjourney',
    iconUrl: 'https://example.com/midjourney-icon.png',
    description: '先进的AI图像生成工具，通过文本描述创建高质量图像。',
    url: 'https://midjourney.com',
    categories: [{ category: { name: '图像生成' } }],
    tags: ['图像AI', '艺术创作', '设计工具'],
    likes: Array(1235).fill(null),
    createdAt: new Date('2023-11-10'),
  },
  {
    id: '3',
    name: 'GitHub Copilot',
    iconUrl: 'https://example.com/copilot-icon.png',
    description: '由OpenAI提供支持的AI编程助手，帮助开发者编写代码。',
    url: 'https://github.com/features/copilot',
    categories: [{ category: { name: '开发工具' } }],
    tags: ['编程助手', '代码生成', '开发效率'],
    likes: Array(987).fill(null),
    createdAt: new Date('2023-11-05'),
  },
]

export function FavoritesList({
  initialWebsites,
  searchQuery = '',
  sortBy = 'latest',
}: FavoritesListProps = {}) {
  // 优先使用传入的数据，否则使用mock数据
  const websitesData = initialWebsites || mockWebsites

  const [websites, setWebsites] = useState<WebsiteData[]>(websitesData)
  const [filteredWebsites, setFilteredWebsites] =
    useState<WebsiteData[]>(websitesData)
  const [loading, setLoading] = useState(false)

  // 处理搜索和排序
  useEffect(() => {
    setLoading(true)

    // 模拟搜索延迟
    setTimeout(() => {
      let result = [...websites]

      // 搜索逻辑
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        result = result.filter(
          (website) =>
            website.name.toLowerCase().includes(query) ||
            website.description.toLowerCase().includes(query) ||
            website.tags.some((tag) => tag.toLowerCase().includes(query)) ||
            website.categories.some((cat) =>
              cat.category?.name.toLowerCase().includes(query)
            )
        )
      }

      // 排序逻辑
      result.sort((a, b) => {
        if (sortBy === 'latest') {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        } else {
          return b.likes.length - a.likes.length
        }
      })

      setFilteredWebsites(result)
      setLoading(false)
    }, 300)
  }, [searchQuery, sortBy, websites])

  // 处理收藏项移除
  const handleRemoveFavorite = (websiteId: string) => {
    setWebsites((prevWebsites) =>
      prevWebsites.filter((w) => w.id !== websiteId)
    )
  }

  // 空状态处理
  if (filteredWebsites.length === 0 && !loading) {
    return <EmptyFavorites />
  }

  return (
    <>
      {/* 搜索和排序控件（如果需要在列表组件内部控制） */}
      {/* 这里的搜索和排序控件已在页面级别实现，这里只保留数据处理逻辑 */}

      {/* 加载状态 */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* 网站列表 */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredWebsites.map((website) => (
            <div
              key={website.id}
              className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            >
              <WebsiteCard
                website={website}
                onUnfavorite={handleRemoveFavorite}
              />
            </div>
          ))}
        </div>
      )}

      {/* 搜索结果统计 */}
      {!loading && filteredWebsites.length > 0 && (
        <div className="text-sm text-muted-foreground mt-2">
          找到 {filteredWebsites.length} 个收藏项
        </div>
      )}
    </>
  )
}
