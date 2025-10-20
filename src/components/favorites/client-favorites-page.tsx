'use client'

import { useState } from 'react'
import { FavoritesList } from '@/components/favorites/favorites-list'
import { WebsitesLoading } from '@/components/websites-loading'
import { Search, Calendar, Heart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

interface ClientFavoritesPageProps {
  initialWebsites: any[]
}

// 客户端组件，用于处理搜索和排序
export function ClientFavoritesPage({
  initialWebsites,
}: ClientFavoritesPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [isLoading, setIsLoading] = useState(false)

  // 处理搜索输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // 处理排序变更
  const handleSortChange = (value: string) => {
    setSortBy(value as 'latest' | 'popular')
  }

  return (
    <div className="container mx-auto pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        {/* 页面标题区域 */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            我的收藏
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            查看和管理您收藏的所有AI网站资源，随时随地访问您喜欢的工具
          </p>
        </div>

        {/* 操作和筛选区域 */}
        <Card className="p-4 bg-card border-border/80 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索收藏的网站..."
                className="pl-10 h-10 border-border/50 bg-background/50"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* 排序方式选择 */}
            <Tabs
              defaultValue="latest"
              className="w-full sm:w-auto"
              onValueChange={handleSortChange}
              value={sortBy}
            >
              <TabsList className="grid grid-cols-2 w-full sm:w-[260px]">
                <TabsTrigger
                  value="latest"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  最近收藏
                </TabsTrigger>
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  最多点赞
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* 收藏内容区域 */}
        {isLoading ? (
          <WebsitesLoading />
        ) : (
          <FavoritesList
            initialWebsites={initialWebsites}
            searchQuery={searchQuery}
            sortBy={sortBy}
          />
        )}
      </div>
    </div>
  )
}
