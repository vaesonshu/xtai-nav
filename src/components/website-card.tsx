'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import {
  Eye,
  Heart,
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { WebsiteEditDialog } from '@/components/website-edit-dialog'
import { WebsiteDeleteDialog } from '@/components/website-delete-dialog'
import { incrementViews } from '@/lib/actions'
import { WebsiteProps } from '@/types/nav-list'

export function WebsiteCard({ website }: { website: WebsiteProps }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [likes, setLikes] = useState(website.likes.length)
  const [views, setViews] = useState(website.views)

  const handleVisit = async () => {
    const newViews = await incrementViews(website.id)
    setViews(newViews)
  }

  // 获取网站分类名称
  const categoryNames = website.categories
    ? website.categories.map((wc) => wc.category?.name).filter(Boolean)
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
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(website.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {website.tags.slice(0, 3).map((tag) => (
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
              disabled={true}
              variant="ghost"
              size="sm"
              className="h-8 px-2"
            >
              <Heart className="mr-1 h-4 w-4 fill-primary" />
              {likes}
            </Button>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              {views}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={handleVisit}
            asChild
          >
            <Link href={website.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" />
              访问
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <WebsiteEditDialog
        website={website}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <WebsiteDeleteDialog
        website={website}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  )
}
