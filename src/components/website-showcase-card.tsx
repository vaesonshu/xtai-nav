'use client'

import { useState } from 'react'
import type React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { incrementLikes } from '@/lib/actions'

type IconName = keyof typeof LucideIcons

interface WebsiteShowcaseCardProps {
  website: {
    id: number | string
    name: string
    icon: IconName
    description: string
    tags: string[]
    url: string
    category: string
    likes?: number
  }
}

export function WebsiteShowcaseCard({ website }: WebsiteShowcaseCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [likes, setLikes] = useState(website.likes || 0)
  const [isLiking, setIsLiking] = useState(false)

  // 使用类型断言来确保图标组件类型正确
  const Icon = (LucideIcons[website.icon] ||
    LucideIcons.Globe) as React.ComponentType<LucideProps>

  const handleLike = async (e: React.MouseEvent) => {
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

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tag', tag)
    router.push(`/showcase?${params.toString()}`)
  }

  return (
    <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium line-clamp-1">{website.name}</h3>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {website.description}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1 w-full">
          {website.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-secondary/80"
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center w-full">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-primary"
            onClick={handleLike}
            disabled={isLiking}
          >
            <LucideIcons.Heart
              className={`h-4 w-4 mr-1 ${likes > 0 ? 'fill-primary text-primary' : ''}`}
            />
            {likes}
          </Button>
          <Link
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            <LucideIcons.ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
