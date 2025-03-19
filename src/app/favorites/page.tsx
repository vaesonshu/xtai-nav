import { Suspense } from 'react'
import { FavoritesList } from '@/components/favorites/favorites-list'
import { WebsitesLoading } from '@/components/websites-loading'
import { auth } from '@clerk/nextjs/server'

export default async function FavoritesPage() {
  const { userId } = await auth()

  if (!userId) {
    return <p className="flex justify-center">登录后查看</p>
  }

  return (
    <div className="px-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">我的收藏</h1>
          <p className="text-muted-foreground">查看您收藏的所有网站。</p>
        </div>

        <Suspense fallback={<WebsitesLoading />}>
          <FavoritesList />
        </Suspense>
      </div>
    </div>
  )
}
