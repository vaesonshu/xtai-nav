'use client'

import Link from 'next/link'
import { useState } from 'react'
import type React from 'react'
import { Heart, Star, ExternalLink, Eye, ArrowUpRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WebsiteProps } from '@/types/nav-list'
import { incrementViews, toggleLike, toggleFavorite } from '@/lib/actions'
import { useAuth } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper'

export function NavCard({ website }: { website: WebsiteProps }) {
  const { isSignedIn } = useAuth()
  const [likes, setLikes] = useState(website.likes?.length || 0)
  const [favorites, setFavorites] = useState(website.favorites?.length || 0)
  const [views, setViews] = useState(website.views)
  const [isLoading, setIsLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(website.hasLiked)
  const [isFavorited, setIsFavorited] = useState(website.hasFavorited)
  const { success, warning, errorToast } = useToast()

  // 访问函数
  const handleVisit = async () => {
    const newViews = await incrementViews(website.id)
    setViews(newViews)
  }

  const handleLike = async (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片的链接导航
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      warning('请先登录哈！')
      return
    }
    try {
      setIsLoading(true)
      const result = await toggleLike(website.id)
      setLikes(result.count)
      setIsLiked(result.liked)
      success(result.liked ? '点赞成功！' : '取消点赞成功！')
    } catch (error) {
      errorToast('点赞失败咯！', {
        description: error as string,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片的链接导航
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      warning('请先登录哈！')
      return
    }

    try {
      setIsLoading(true)
      const result = await toggleFavorite(website.id)
      setIsFavorited(result.favorited)
      setFavorites((prev: number) =>
        result.favorited ? prev + 1 : Math.max(0, prev - 1)
      )
      success(result.favorited ? '收藏成功！' : '取消收藏成功！')
    } catch (error) {
      errorToast('收藏失败咯！', {
        description: error as string,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-[1.03] hover:border-primary/50 bg-card/90 backdrop-blur-sm group">
      {/* 分类标签 */}
      {/* {website.category && (
        <div className="absolute right-2 top-2 z-10">
          <Badge
            variant="outline"
            className="bg-background/80 text-xs px-2 py-0.5"
          >
            {website.category}
          </Badge>
        </div>
      )} */}

      <CardHeader className="pb-2 relative">
        <div className="flex items-center gap-2">
          <Avatar className="transition-transform duration-300 group-hover:scale-110">
            <AvatarImage src={website.iconUrl} alt={website.name} />
            <AvatarFallback className="text-lg font-semibold text-muted-foreground bg-primary/10">
              {website.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-medium line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-200">
            {website.name}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {website.description || '暂无描述'}
        </p>
      </CardContent>

      <CardFooter className="flex flex-col items-start">
        {/* 标签 */}
        <div className="flex flex-wrap gap-1 pb-3">
          {website.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors duration-200"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1">
            {/* 点赞 */}
            <TooltipWrapper
              content={isLiked ? '取消点赞' : '点赞'}
              side="top"
              delayDuration={200}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 rounded-full transition-all duration-200 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart
                  className={`mr-1 h-4 w-4 transition-all duration-200 ${isLiked ? 'fill-red-500' : ''}`}
                />
                {likes}
              </Button>
            </TooltipWrapper>

            {/* 收藏 */}
            <TooltipWrapper
              content={isFavorited ? '取消收藏' : '收藏'}
              side="top"
              delayDuration={200}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 rounded-full transition-all duration-200 ${isFavorited ? 'text-yellow-500' : 'text-muted-foreground hover:text-yellow-500'}`}
                onClick={handleFavorite}
                disabled={isLoading}
              >
                <Star
                  className={`mr-1 h-4 w-4 transition-all duration-200 ${isFavorited ? 'fill-yellow-500' : ''}`}
                />
                {favorites}
              </Button>
            </TooltipWrapper>

            {/* 查看次数 */}
            <div className="flex items-center text-xs text-muted-foreground ml-1">
              <Eye className="mr-1 h-3.5 w-3.5" />
              {views}
            </div>
          </div>

          <div className="">
            {/* 访问 */}
            <TooltipWrapper
              content={`访问 ${website.name}`}
              side="top"
              delayDuration={200}
            >
              <Button
                variant="default"
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-lg"
                onClick={handleVisit}
                asChild
              >
                <Link
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipWrapper>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
