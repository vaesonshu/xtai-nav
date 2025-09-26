'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ExternalLink, Tag } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function WebsiteCard({ website }: { website: any }) {
  const [likes] = useState(website.likes.length)

  // 获取网站分类名称
  const categoryNames = website.categories
    ? website.categories.map((wc: any) => wc.category?.name).filter(Boolean)
    : []

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={website.iconUrl} />
              <AvatarFallback className="text-lg font-semibold text-muted-foreground">
                {website.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold leading-none">{website.name}</h3>
            </div>
          </div>
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
          <Button variant="outline" size="sm" className="h-8" asChild>
            <Link href={website.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              访问
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
