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
  Star,
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
import { incrementViews, toggleLike, toggleFavorite } from '@/lib/actions'
import { WebsiteProps } from '@/types/nav-list'
import { useAuth } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper'

interface WebsiteCardProps {
  website: any
  layout?: 'card' | 'row'
  allowOperations?: boolean
  allowUserOperations?: boolean
}

export function WebsiteCard({
  website,
  layout = 'card',
  allowOperations = false,
  allowUserOperations = true,
}: WebsiteCardProps) {
  const { isSignedIn } = useAuth()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [likes, setLikes] = useState(website.likes?.length || 0)
  const [favorites, setFavorites] = useState(website.favorites?.length || 0)
  const [views, setViews] = useState(website.views || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(website.hasLiked)
  const [isFavorited, setIsFavorited] = useState(website.hasFavorited)
  const { success, warning, errorToast } = useToast()

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

  // 获取网站分类名称
  const categoryNames = website.categories
    ? website.categories.map((wc: any) => wc.name).filter(Boolean)
    : []

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/60 border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between space-x-6">
          {/* 左侧网站信息 */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Avatar className="h-14 w-14 border-2 border-gray-200 shrink-0">
              <AvatarImage src={website.iconUrl} alt={website.name} />
              <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {website.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate group-hover:text-blue-600 transition-colors">
                {website.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                {website.description || '暂无描述'}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {/* <span>
                  {formatDistanceToNow(new Date(website.createdAt), {
                    addSuffix: true,
                  })}
                </span> */}
                {categoryNames.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-blue-500" />
                    <span className="text-blue-600 font-medium">
                      {categoryNames.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 中间标签区域 */}
          <div className="hidden md:flex flex-wrap gap-1.5 max-w-xs shrink-0">
            {website.tags.slice(0, 4).map((tag: any) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {tag}
              </Badge>
            ))}
            {website.tags.length > 4 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 border-gray-300 text-gray-500"
              >
                +{website.tags.length - 4}
              </Badge>
            )}
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center shrink-0">
            <div className="flex items-center space-x-3">
              {/* 用户操作按钮 - 点赞、收藏、查看次数 */}
              <div className="flex items-center space-x-1">
                <>
                  {allowUserOperations ? (
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
                  ) : (
                    <TooltipWrapper
                      content="仅查看模式"
                      side="top"
                      delayDuration={200}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 rounded-full transition-all duration-200 cursor-not-allowed text-red-500 pointer-events-none`}
                      >
                        <Heart className="mr-1 h-4 w-4 fill-red-500 text-red-500" />
                        {likes}
                      </Button>
                    </TooltipWrapper>
                  )}
                </>

                <>
                  {allowUserOperations ? (
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
                  ) : (
                    <TooltipWrapper
                      content="仅查看模式"
                      side="top"
                      delayDuration={200}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 rounded-full transition-all duration-200 cursor-not-allowed text-yellow-500 pointer-events-none`}
                      >
                        <Star className="mr-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {favorites}
                      </Button>
                    </TooltipWrapper>
                  )}
                </>

                <div className="flex items-center text-sm text-muted-foreground ml-1">
                  <Eye className="mr-1.5 h-4 w-4 text-blue-400" />
                  <span className="font-medium">{views}</span>
                </div>
              </div>

              {/* 分隔符 */}
              <div className="h-5 w-px bg-gray-300"></div>

              {/* 右侧操作按钮 */}
              <div className="flex items-center space-x-2">
                <TooltipWrapper
                  content={`访问 ${website.name}`}
                  side="top"
                  delayDuration={200}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="h-9 w-9 p-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 hover:from-purple-500 hover:to-blue-500 text-white shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    onClick={handleVisit}
                    asChild
                  >
                    <Link
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipWrapper>

                {allowOperations && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 opacity-50 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
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
                )}
              </div>
            </div>
          </div>

          {/* 移动端标签显示 */}
          <div className="md:hidden flex flex-wrap gap-1 max-w-xs shrink-0">
            {website.tags.slice(0, 2).map((tag: any) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700"
              >
                {tag}
              </Badge>
            ))}
            {website.tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0.5 border-gray-300 text-gray-500"
              >
                +{website.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
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
