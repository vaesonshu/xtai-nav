'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type React from 'react'
import * as LucideIcons from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WebsiteProps } from '@/types/nav-list'
import {
  incrementViews,
  toggleLike,
  toggleFavorite,
  hasUserLikedWebsite,
  hasUserFavoritedWebsite,
} from '@/lib/actions'
import { useAuth } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper'

export function NavCard({ website }: { website: WebsiteProps }) {
  console.log('---website---', website)
  const { isSignedIn } = useAuth()
  const [likes, setLikes] = useState(website.likes?.length || 0)
  const [views, setViews] = useState(website.views)
  const [isLoading, setIsLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const { warning } = useToast()

  // 初始化获取点赞量和收藏量
  useEffect(() => {
    // Check if the user has liked or favorited this website
    async function checkUserInteractions() {
      if (isSignedIn) {
        const liked = await hasUserLikedWebsite(website.id)
        const favorited = await hasUserFavoritedWebsite(website.id)
        setIsLiked(liked)
        setIsFavorited(favorited)
      }
    }

    checkUserInteractions()
  }, [website.id, isSignedIn])

  // 访问函数
  const handleVisit = async () => {
    const newViews = await incrementViews(website.id)
    setViews(newViews)
  }

  const HeartIcon = LucideIcons.Heart
  const Star = LucideIcons.Star
  const Eye = LucideIcons.Eye

  const handleLike = async (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片的链接导航
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      // Redirect to sign in or show a message
      warning('请先登录')
      return
    }
    try {
      setIsLoading(true)
      const result = await toggleLike(website.id)
      setLikes(result.count)
      setIsLiked(result.liked)
    } catch (error) {
      console.error('点赞失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!isSignedIn) {
      // Redirect to sign in or show a message
      return
    }

    try {
      setIsLoading(true)
      const result = await toggleFavorite(website.id)
      setIsFavorited(result.favorited)
    } catch (error) {
      console.error('收藏失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={website.iconUrl} />
            <AvatarFallback className="text-lg font-semibold text-muted-foreground">
              {website.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-medium line-clamp-1">{website.name}</h3>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {website.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {website.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* 点赞 */}
          <TooltipWrapper
            content={isLiked ? '取消点赞' : '点赞'}
            side="top"
            delayDuration={200}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isLiked ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={handleLike}
              disabled={isLoading}
            >
              <HeartIcon
                className={`mr-1 h-4 w-4 ${isLiked ? 'fill-primary' : ''}`}
              />
              {likes}
            </Button>
          </TooltipWrapper>

          {/* 收藏 */}
          <TooltipWrapper
            content={isLiked ? '取消收藏' : '收藏'}
            side="top"
            delayDuration={200}
          >
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${isFavorited ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={handleFavorite}
              disabled={isLoading}
            >
              <Star
                className={`mr-1 h-4 w-4 ${isFavorited ? 'fill-primary' : ''}`}
              />
            </Button>
          </TooltipWrapper>

          {/* 查看次数 */}
          {/* <div className="flex items-center">
            <Eye className="mr-1 h-4 w-4" />
            {views}
          </div> */}
          {/* 访问 */}
          <TooltipWrapper
            content={'访问' + website.name}
            side="top"
            delayDuration={200}
          >
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={handleVisit}
              asChild
            >
              <Link
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <LucideIcons.ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </TooltipWrapper>
        </div>
      </CardFooter>
    </Card>
  )
}
