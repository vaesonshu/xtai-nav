import { Bookmark } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function EmptyFavorites() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Bookmark className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">暂无收藏</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
        您还没有收藏任何网站。浏览网站并点击收藏按钮来添加到您的收藏列表。
      </p>
      <Button asChild>
        <Link href="/">浏览网站</Link>
      </Button>
    </div>
  )
}
