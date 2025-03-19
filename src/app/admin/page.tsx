import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WebsiteList } from '@/components/website-list'
import { WebsiteCreateButton } from '@/components/website-create-button'
import { CategoryCreateButton } from '@/components/category-create-button'
import { SearchForm } from '@/components/search-form'
import { WebsitesLoading } from '@/components/websites-loading'
import { House } from 'lucide-react'
import { auth } from '@clerk/nextjs/server'
import { isAdmin } from '@/lib/utils'
import NotAuthorized from '@/components/not-authorized'

export default async function AdminPage() {
  const { userId } = await auth()
  const userInfo = await isAdmin(userId!)

  if (!userInfo) {
    return <NotAuthorized />
  }

  return (
    <div className="p-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">网站管理</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <House className="mr-2 h-4 w-4" />
              <Link href={'/'}>返回首页</Link>
            </Button>
            <CategoryCreateButton />
            <WebsiteCreateButton />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            管理您收藏的网站，添加分类和标签，跟踪访问量和点赞数。
          </p>
          <Suspense
            fallback={<div className="text-gray-500">加载搜索框中...</div>}
          >
            <SearchForm />
          </Suspense>
        </div>
        <Suspense fallback={<WebsitesLoading />}>
          <WebsiteList />
        </Suspense>
      </div>
    </div>
  )
}
