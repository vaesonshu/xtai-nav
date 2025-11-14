import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WebsiteList } from '@/components/website-list'
import { WebsiteCreateButton } from '@/components/website-create-button'
import { CategoryCreateButton } from '@/components/category-create-button'
import { SearchForm } from '@/components/search-form'
import { WebsitesLoading } from '@/components/websites-loading'
import { House, Globe, FolderOpen, Users, TrendingUp } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/utils'
import { getWebsites } from '@/lib/data'
import { getCategories } from '@/lib/actions'
import NotAuthorized from '@/components/not-authorized'

interface AdminPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getStats() {
  const [websitesData, categoriesData] = await Promise.all([
    getWebsites(),
    getCategories(),
  ])

  const websites = websitesData.websites
  const categories = categoriesData

  const totalViews = websites.reduce((sum, site) => sum + site.views, 0)
  const totalLikes = websites.reduce((sum, site) => sum + site.likes.length, 0)

  return {
    websitesCount: websites.length,
    categoriesCount: categories.length,
    totalViews,
    totalLikes,
  }
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { userId } = await auth()
  const userInfo = await isAdmin(userId!)

  if (!userInfo) {
    return <NotAuthorized />
  }

  // 等待获取searchParams的实际值
  const params = await searchParams
  const stats = await getStats()
  const search = typeof params.search === 'string' ? params.search : ''

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                网站管理
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                管理您收藏的网站，添加分类和标签，跟踪访问量和点赞数。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <CategoryCreateButton />
              <WebsiteCreateButton />
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <Suspense
                  fallback={
                    <div className="text-gray-500">加载搜索框中...</div>
                  }
                >
                  <SearchForm />
                </Suspense>
              </div>
              <div className="text-sm text-muted-foreground">
                快速搜索网站名称、描述或标签
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                网站总数
              </CardTitle>
              <Globe className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.websitesCount}
              </div>
              <p className="text-xs text-muted-foreground">已收录的网站</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                分类数量
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.categoriesCount}
              </div>
              <p className="text-xs text-muted-foreground">网站分类</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                总访问量
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">网站访问次数</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                总点赞数
              </CardTitle>
              <Users className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalLikes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">用户点赞总数</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <Suspense fallback={<WebsitesLoading />}>
            <WebsiteList
              search={search}
              allowOperations={true}
              allowUserOperations={false}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
