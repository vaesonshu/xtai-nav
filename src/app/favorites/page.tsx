import { Bookmark } from 'lucide-react'
import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { getUserFavorites } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { ClientFavoritesPage } from '@/components/favorites/client-favorites-page'

// Force dynamic rendering to allow cookies usage
export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  let userId: string | undefined

  try {
    const headers = new Headers()
    const cookieStore = await cookies()
    cookieStore.getAll().forEach((cookie) => {
      headers.append('Cookie', `${cookie.name}=${cookie.value}`)
    })

    const session = await auth.api.getSession({ headers })
    userId = session?.user?.id
  } catch (error) {
    console.error('Auth error:', error)
    userId = undefined
  }

  // 获取收藏数据（在服务器端）
  let websites: any[] = []
  if (userId) {
    try {
      websites = await getUserFavorites()
    } catch (error) {
      console.error('获取收藏失败:', error)
      // 如果获取失败，使用空数组
      websites = []
    }
  }

  if (!userId) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            登录后可以查看和管理您收藏的所有AI网站资源
          </p>
          {/* <Button>立即登录</Button> */}
        </div>
      </div>
    )
  }

  // 使用独立的客户端组件来处理搜索和排序
  return <ClientFavoritesPage initialWebsites={websites} />
}
