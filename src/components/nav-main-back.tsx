import { Suspense } from 'react'
import { WebsiteShowcase } from '@/components/website-showcase'
import { WebsitesLoading } from '@/components/websites-loading'
import { TagList } from '@/components/tag-list'

export default function ShowcasePage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">网站展示</h1>
          <p className="text-muted-foreground">
            发现精选网站，探索不同领域的优质内容。
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-10 w-full animate-pulse bg-muted rounded-md" />
          }
        >
          <TagList />
        </Suspense>

        <Suspense fallback={<WebsitesLoading />}>
          <WebsiteShowcase />
        </Suspense>
      </div>
    </div>
  )
}
