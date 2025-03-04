import { Suspense } from 'react'
import { getWebsites } from '@/lib/data'
import NavMain from '@/components/nav-main'
import { WebsitesLoading } from '@/components/websites-loading'

export default async function NavShowcase({}: {
  search?: string
  tag?: string
}) {
  const websites = await getWebsites()
  console.log('1111111', websites)

  // todo: 后续优化UI
  if (websites.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">暂无相关网站</p>
      </div>
    )
  }

  return (
    <Suspense fallback={<WebsitesLoading />}>
      <NavMain websites={websites} />
    </Suspense>
  )
}
