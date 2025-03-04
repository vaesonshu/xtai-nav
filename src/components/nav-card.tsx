'use client'

import { useState } from 'react'
import type React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import * as LucideIcons from 'lucide-react'
import Link from 'next/link'
import { incrementLikes } from '@/lib/actions'
import { NavCardProps } from '@/types/nav-list'

export function NavCard({ website }: { website: NavCardProps }) {
  const [likes, setLikes] = useState(website.likes || 0)
  const [isLiking, setIsLiking] = useState(false)

  const HeartIcon = LucideIcons.Heart

  const handleLike = async (e: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片的链接导航
    e.preventDefault()
    e.stopPropagation()

    if (isLiking) return

    try {
      setIsLiking(true)
      const newLikes = await incrementLikes(website.id)
      setLikes(newLikes)
    } catch (error) {
      console.error('点赞失败:', error)
    } finally {
      setIsLiking(false)
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-primary"
            onClick={handleLike}
            disabled={isLiking}
          >
            <HeartIcon
              className={`h-4 w-4 mr-1 ${likes > 0 ? 'fill-primary text-primary' : ''}`}
            />
            {likes}
          </Button>
          <Link
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            <LucideIcons.ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
