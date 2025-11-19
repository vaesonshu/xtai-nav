import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WebsitesLoading } from '@/components/websites-loading'
import { House, Globe, FileText, Users, TrendingUp } from 'lucide-react'
import { getCurrentUserId } from '@/lib/auth-client'
import { isAdmin } from '@/lib/utils'
import { getWebsites } from '@/lib/data'
import { getCategories } from '@/lib/actions'
import LogManage from '@/components/admin/log-manage'
import WebManage from '@/components/admin/web-manage'
import PendingWebsitesManage from '@/components/admin/pending-websites-manage'
import NotAuthorized from '@/components/not-authorized'
import Link from 'next/link'

// Force dynamic rendering to allow cookies usage
export const dynamic = 'force-dynamic'

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
  const userId = await getCurrentUserId()

  // 权限检查
  if (!userId) {
    redirect('/')
  }

  const userInfo = await isAdmin(userId)
  if (!userInfo) {
    return <NotAuthorized />
  }

  const stats = await getStats()

  // 获取当前页面的参数，默认为overview
  const currentPage = ((await searchParams)?.page as string) || 'overview'

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 左侧导航栏 */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">管理员控制台</h1>
          <p className="text-sm text-muted-foreground mt-1">
            管理网站内容和数据
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin?page=overview"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'overview' || !currentPage
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-700 hover:bg-blue-25 hover:text-blue-600 hover:shadow-sm'
            }`}
          >
            <Globe className="mr-3 h-5 w-5" />
            总览
          </Link>
          <Link
            href="/admin?page=pending"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'pending'
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm'
                : 'text-gray-700 hover:bg-yellow-25 hover:text-yellow-600 hover:shadow-sm'
            }`}
          >
            <TrendingUp className="mr-3 h-5 w-5" />
            待审批网站
          </Link>
          <Link
            href="/admin?page=websites"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'websites'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-700 hover:bg-blue-25 hover:text-blue-600 hover:shadow-sm'
            }`}
          >
            <House className="mr-3 h-5 w-5" />
            网站管理
          </Link>
          <Link
            href="/admin?page=logs"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 'logs'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-700 hover:bg-blue-25 hover:text-blue-600 hover:shadow-sm'
            }`}
          >
            <FileText className="mr-3 h-5 w-5" />
            日志管理
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full" asChild>
            <Link href={'/'}>
              <House className="mr-2 h-4 w-4" />
              返回首页
            </Link>
          </Button>
        </div>
      </div>

      {/* 右侧内容区域 */}
      <div className="ml-64 min-h-screen overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {currentPage === 'overview' || !currentPage ? (
            <>
              {/* 欢迎区域 */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <House className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        欢迎回来，管理员
                      </h1>
                      <p className="text-gray-600">
                        控制台可以帮助您高效管理网站内容和系统数据
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900 mb-1">
                        网站管理
                      </h3>
                      <p className="text-sm text-gray-600">
                        添加、编辑和组织网站内容
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900 mb-1">
                        数据监控
                      </h3>
                      <p className="text-sm text-gray-600">
                        实时查看访问量和用户统计
                      </p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center">
                      <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900 mb-1">
                        日志分析
                      </h3>
                      <p className="text-sm text-gray-600">
                        深入了解系统运行状况
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 统计数据区域 */}
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
                    <p className="text-xs text-muted-foreground">
                      已收录的网站
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      分类数量
                    </CardTitle>
                    <FileText className="h-4 w-4 text-green-600" />
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
                    <p className="text-xs text-muted-foreground">
                      网站访问次数
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      用户点赞总数
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 概述内容 */}
              <div className="space-y-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>欢迎使用管理员控制台</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      从左侧菜单选择您要管理的功能模块。您可以管理网站内容、查看和分析日志记录，以及监控系统统计数据。
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : currentPage === 'websites' ? (
            <div className="space-y-2">
              <Suspense fallback={<WebsitesLoading />}>
                <WebManage searchParams={searchParams} />
              </Suspense>
            </div>
          ) : currentPage === 'pending' ? (
            <div className="space-y-6">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                  待审批网站
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  审核用户提交的网站，只有通过审批的网站才会公开显示。
                </p>
              </div>

              <Suspense
                fallback={
                  <div className="p-6 text-center text-gray-500">
                    加载待审批网站...
                  </div>
                }
              >
                <PendingWebsitesManage />
              </Suspense>
            </div>
          ) : currentPage === 'logs' ? (
            <div className="space-y-2">
              <Suspense
                fallback={
                  <div className="p-6 text-center text-gray-500">
                    加载日志管理...
                  </div>
                }
              >
                <LogManage />
              </Suspense>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
