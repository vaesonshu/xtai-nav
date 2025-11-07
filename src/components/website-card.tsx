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

export function WebsiteCard({ website }: { website: any }) {
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
    ? website.categories.map((wc: any) => wc.category?.name).filter(Boolean)
    : []

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 border-gray-200/60 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12 border-2 border-gray-100">
                <AvatarImage src={website.iconUrl} alt={website.name} />
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {website.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 leading-tight truncate group-hover:text-blue-600 transition-colors">
                  {website.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(website.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">打开菜单</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setShowEditDialog(true)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
            {website.description || '暂无描述'}
          </p>

          {categoryNames.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Tag className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-blue-600 font-medium">
                {categoryNames.join(', ')}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {website.tags.slice(0, 3).map((tag: any) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {website.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 border-gray-300 text-gray-500"
              >
                +{website.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="mr-1.5 h-4 w-4 text-red-400" />
              <span className="font-medium">{likes}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Eye className="mr-1.5 h-4 w-4 text-blue-400" />
              <span className="font-medium">{views}</span>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleVisit}
            asChild
          >
            <Link href={website.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
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
