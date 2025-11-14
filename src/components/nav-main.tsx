'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { NavCard } from '@/components/nav-card'
import { WebsiteCard } from '@/components/website-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Search,
  ArrowUpRight,
  TrendingUp,
  Award,
  Clock,
  RefreshCw,
  Star,
  Heart,
  Sparkles,
  Filter,
  Check,
  Grid3X3,
  List,
} from 'lucide-react'
import { WebsiteProps } from '@/types/nav-list'
import { EmptyState } from './empty-state'
import { useToast } from '@/hooks/use-toast'

export default function NavMain({ websites }: { websites: WebsiteProps[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'recent'>(
    'all'
  )
  const [filteredWebsites, setFilteredWebsites] = useState<WebsiteProps[]>([])
  const [layout, setLayout] = useState<'card' | 'row'>('card')

  const { success } = useToast()

  // 获取所有标签
  const allTags = Array.from(new Set(websites.flatMap((site) => site.tags)))

  // 获取所有分类
  const allCategories = Array.from(
    new Set(websites.flatMap((site) => site.categories.map((c) => c.name)))
  )

  // 过滤网站
  useEffect(() => {
    setIsLoading(true)

    // 模拟加载延迟，增强用户体验
    setTimeout(() => {
      let result = [...websites]

      // 根据活动标签筛选
      if (activeTab === 'popular') {
        result = result.sort(
          (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
        )
      } else if (activeTab === 'recent') {
        result = result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      }

      // 根据搜索词筛选
      result = result.filter(
        (website) =>
          website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (website.description &&
            website.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          website.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )

      // 根据选中的标签筛选
      if (selectedTag) {
        result = result.filter((website) => website.tags.includes(selectedTag))
      }

      // 根据选中的分类筛选
      if (selectedCategory) {
        result = result.filter((website) =>
          website.categories.some((c) => c.name === selectedCategory)
        )
      }

      setFilteredWebsites(result)
      setIsLoading(false)
    }, 300)
  }, [searchTerm, selectedTag, selectedCategory, activeTab, websites])

  // 重置所有筛选条件
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedTag(null)
    setSelectedCategory(null)
    setActiveTab('all')
    success('筛选条件已重置')
  }

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm('')
  }

  return (
    <div className="container mx-auto pb-8 px-4 sm:px-6 lg:px-8 w-full max-w-7xl">
      {/* 标题区域 - 优化后更加紧凑 */}
      <div className="text-center mb-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          星途 AI 导航
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-3">
          发现优质 AI 应用网站资源，一站式导航让您的 AI 探索之旅更加便捷
        </p>
        <div className="flex flex-wrap justify-center text-xs text-muted-foreground gap-2">
          <span className="flex items-center bg-secondary/30 px-2.5 py-1 rounded-full transition-all hover:bg-secondary">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            {websites.length} 个网站
          </span>
          <span className="flex items-center bg-secondary/30 px-2.5 py-1 rounded-full transition-all hover:bg-secondary">
            <Award className="mr-1 h-3 w-3" />
            {allCategories.length} 个分类
          </span>
          <span className="flex items-center bg-secondary/30 px-2.5 py-1 rounded-full transition-all hover:bg-secondary">
            <TrendingUp className="mr-1 h-3 w-3" />
            {allTags.length} 个标签
          </span>
        </div>
      </div>

      {/* 搜索和筛选区域 - 优化为弹窗模式 */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        {/* 搜索框 */}
        <div className="relative w-full sm:w-72 md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-hover:text-primary">
            <Search className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </div>
          <Input
            placeholder="搜索网站名称、描述或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-2.5 border-input focus:ring-2 focus:ring-primary/20 transition-all duration-300"
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
              onClick={clearSearch}
              aria-label="清除搜索"
            >
              <svg
                className="h-5 w-5 transition-transform duration-200 hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex gap-3 items-center w-full sm:w-auto justify-center sm:justify-end">
          {/* 布局切换开关 */}
          <div className="flex rounded-full bg-secondary p-1 border">
            <Button
              variant={layout === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('card')}
              className="h-8 w-8 p-0 rounded-full"
              aria-label="网格布局"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'row' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLayout('row')}
              className="h-8 w-8 p-0 rounded-full"
              aria-label="列表布局"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* 排序选项卡 */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                id: 'all',
                label: '全部',
                icon: <Clock className="mr-1 h-3.5 w-3.5" />,
              },
              {
                id: 'popular',
                label: '热门',
                icon: <TrendingUp className="mr-1 h-3.5 w-3.5" />,
              },
              {
                id: 'recent',
                label: '最新',
                icon: <RefreshCw className="mr-1 h-3.5 w-3.5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center
                  ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md transform scale-105'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:shadow-sm'
                  }
                `}
                aria-pressed={activeTab === tab.id}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* 弹窗式筛选器 */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="px-4 py-2 bg-card border rounded-lg flex items-center text-sm shadow-sm hover:shadow transition-all"
                aria-label="打开筛选器"
              >
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">高级筛选</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-2">
                {/* 搜索框（在弹窗中也显示） */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    placeholder="搜索网站..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors"
                      onClick={clearSearch}
                      aria-label="清除搜索"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 分类筛选 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
                    <Award className="mr-1.5 h-3.5 w-3.5" />
                    分类
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        selectedCategory === null ? 'default' : 'outline'
                      }
                      className="cursor-pointer px-3 py-1.5 text-xs hover:shadow-sm transition-all duration-200 hover:scale-105"
                      onClick={() => setSelectedCategory(null)}
                    >
                      全部分类
                    </Badge>
                    {allCategories.map((category, index) => (
                      <Badge
                        key={index}
                        variant={
                          selectedCategory === category ? 'default' : 'outline'
                        }
                        className="cursor-pointer px-3 py-1.5 text-xs hover:shadow-sm transition-all duration-200 hover:scale-105"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 标签筛选 */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground flex items-center">
                    <TrendingUp className="mr-1.5 h-3.5 w-3.5" />
                    标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedTag === null ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1.5 text-xs hover:shadow-sm transition-all duration-200 hover:scale-105"
                      onClick={() => setSelectedTag(null)}
                    >
                      全部标签
                    </Badge>
                    {allTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant={selectedTag === tag ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1.5 text-xs hover:shadow-sm transition-all duration-200 hover:scale-105"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 操作按钮区域 */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  {(searchTerm || selectedTag || selectedCategory) && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-200 flex items-center hover:scale-105 flex-1 sm:flex-initial justify-center"
                      aria-label="重置筛选条件"
                    >
                      <RefreshCw className="mr-1.5 h-4 w-4" />
                      重置所有筛选
                    </button>
                  )}

                  {/* 确认按钮 - 点击后关闭弹框 */}
                  <DialogClose asChild>
                    <button
                      className="px-6 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 flex items-center justify-center hover:scale-105 flex-1 sm:flex-initial"
                      aria-label="确认筛选并关闭"
                    >
                      <Check className="mr-1.5 h-4 w-4" />
                      确认
                    </button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 筛选结果统计 */}
      {(searchTerm || selectedTag || selectedCategory) && (
        <div className="mb-6 flex flex-wrap justify-between items-center px-2 gap-2">
          <p className="text-sm text-muted-foreground">
            找到 {filteredWebsites.length} 个匹配的网站
            {searchTerm && (
              <span className="ml-1 font-medium text-foreground">
                （搜索: {searchTerm}）
              </span>
            )}
            {selectedCategory && (
              <span className="ml-1 font-medium text-foreground">
                （分类: {selectedCategory}）
              </span>
            )}
            {selectedTag && (
              <span className="ml-1 font-medium text-foreground">
                （标签: {selectedTag}）
              </span>
            )}
          </p>
          <button
            onClick={resetFilters}
            className="text-xs text-primary hover:underline flex items-center"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            重置筛选
          </button>
        </div>
      )}

      {/* 网站卡片网格 - 支持布局切换 */}
      {isLoading ? (
        layout === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-xl shadow-sm border p-5 animate-pulse"
              >
                <div className="h-10 w-10 rounded-full bg-muted mb-3"></div>
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded mb-3"></div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <div className="h-5 w-14 bg-muted rounded-full"></div>
                  <div className="h-5 w-14 bg-muted rounded-full"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-5 w-16 bg-muted rounded"></div>
                  <div className="h-7 w-7 bg-muted rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-card rounded-xl shadow-sm border p-6 animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 rounded-full bg-muted"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-10 bg-muted rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredWebsites.length > 0 ? (
        layout === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredWebsites.map((website, index) => (
              <div
                key={website.id}
                className="animate-in fade-in-50 duration-500"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <NavCard website={website} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredWebsites.map((website, index) => (
              <div
                key={website.id}
                className="animate-in fade-in-50 duration-500"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <WebsiteCard website={website as any} allowOperations={false} />
              </div>
            ))}
          </div>
        )
      ) : (
        <EmptyState
          title={searchTerm ? '没有找到匹配的网站' : '暂无网站数据'}
          description={
            searchTerm
              ? '尝试使用不同的搜索词，或者清除筛选条件查看所有网站'
              : '我们正在努力收录更多优质的 AI 网站'
          }
          onReset={resetFilters}
          showResetButton={Boolean(
            searchTerm || selectedTag || selectedCategory
          )}
        />
      )}

      {/* 热门推荐区域 - 根据布局状态调整显示 */}
      {filteredWebsites.length > 0 && activeTab === 'all' && (
        <div className="mt-10 mb-8">
          <div className="flex items-center mb-4 gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <h2 className="text-lg font-bold">热门推荐</h2>
            <span className="text-xs text-muted-foreground">
              （基于用户点赞）
            </span>
          </div>
          {layout === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {websites
                .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
                .slice(0, 4)
                .map((website, index) => (
                  <div
                    key={website.id}
                    className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="relative">
                      <NavCard website={website} />
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-sm font-bold text-xs">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {websites
                .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
                .slice(0, 4)
                .map((website, index) => (
                  <div
                    key={website.id}
                    className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="relative">
                      <WebsiteCard
                        website={website as any}
                        allowOperations={false}
                      />
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full h-6 w-6 flex items-center justify-center shadow-sm font-bold text-xs">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
