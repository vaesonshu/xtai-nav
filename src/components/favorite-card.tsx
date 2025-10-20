'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ExternalLink, Tag, X } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { toggleFavorite } from '@/lib/actions'

export function WebsiteCard({
  website,
  onUnfavorite,
}: {
  website: any
  onUnfavorite?: (websiteId: string) => void
}) {
  const [likes] = useState(website.likes.length)
  const [isLoading, setIsLoading] = useState(false)

  // 获取网站分类名称
  const categoryNames = website.categories
    ? website.categories.map((wc: any) => wc.category?.name).filter(Boolean)
    : []

  // 处理取消收藏
  const handleUnfavorite = async () => {
    try {
      setIsLoading(true)
      await toggleFavorite(website.id)
      toast.success('已取消收藏')
      // 通知父组件更新列表
      if (onUnfavorite) {
        onUnfavorite(website.id)
      }
    } catch (error) {
      toast.error('取消收藏失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.02] border-border/80">
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-background">
              <AvatarImage src={website.iconUrl} alt={website.name} />
              <AvatarFallback className="text-lg font-semibold text-muted-foreground">
                {website.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold leading-none line-clamp-1">
                {website.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {new URL(website.url).hostname}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100 hover:text-destructive"
            onClick={handleUnfavorite}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {website.description || '暂无描述'}
          </p>
          {categoryNames.length > 0 && (
            <div className="mt-3 flex items-center gap-1">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {categoryNames.join(', ')}
              </span>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1">
            {website.tags.slice(0, 3).map((tag: any) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {website.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{website.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-2 cursor-default"
            >
              <Heart className="mr-1 h-4 w-4 fill-red-500 text-red-500" />
              {likes}
            </Button>
          </div>
          <Button variant="default" size="sm" className="h-8 gap-1" asChild>
            <Link href={website.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              访问
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
