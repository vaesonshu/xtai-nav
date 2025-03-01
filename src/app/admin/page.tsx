import { Suspense } from 'react'
import { WebsiteList } from '@/components/website-list'
import { WebsiteCreateButton } from '@/components/website-create-button'
import { SearchForm } from '@/components/search-form'
import { WebsitesLoading } from '@/components/websites-loading'

export default function HomePage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">网站管理</h1>
          <WebsiteCreateButton />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            管理您收藏的网站，添加分类和标签，跟踪访问量和点赞数。
          </p>
          <SearchForm />
        </div>
        <Suspense fallback={<WebsitesLoading />}>
          <WebsiteList />
        </Suspense>
      </div>
    </div>
  )
}
