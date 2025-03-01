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
import { WebsiteEditDialog } from '@/components/website-edit-dialog'
import { WebsiteDeleteDialog } from '@/components/website-delete-dialog'
import { incrementViews, incrementLikes } from '@/lib/actions'

export function WebsiteCard({ website }) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [likes, setLikes] = useState(website.likes)
  const [views, setViews] = useState(website.views)

  const handleVisit = async () => {
    const newViews = await incrementViews(website.id)
    setViews(newViews)
  }

  const handleLike = async () => {
    const newLikes = await incrementLikes(website.id)
    setLikes(newLikes)
  }

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-center space-x-3">
            {website.iconUrl ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-md">
                <Image
                  src={website.iconUrl || '/placeholder.svg'}
                  alt={website.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <span className="text-lg font-semibold text-muted-foreground">
                  {website.name.charAt(0)}
                </span>
              </div>
            )}
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
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={handleLike}
            >
              <Heart className="mr-1 h-4 w-4" />
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
