'use client'

import { useState, useEffect } from 'react'
import { WebsiteProps } from '@/types/nav-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserSubmittedWebsites, deleteUserWebsite } from '@/lib/actions'
import { WebsiteForm } from '@/components/website-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Clock,
  Check,
  X,
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Website {
  id: string
  name: string
  url: string
  iconUrl: string | null
  description: string
  tags: string[]
  createdAt: string | Date
  approvalStatus: string
  rejectReason?: string | null
  categories: {
    categoryId: string
    websiteId: string
    category: {
      id: string
      name: string
      slug: string
    }
  }[]
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          待审批
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          已通过
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          已拒绝
        </Badge>
      )
    default:
      return <Badge variant="outline">未知状态</Badge>
  }
}

function getStatusDescription(status: string) {
  switch (status) {
    case 'pending':
      return '网站已提交，正在等待管理员审核'
    case 'approved':
      return '网站已通过审核，现在显示在网站列表中'
    case 'rejected':
      return '网站审核未通过，请查看拒绝原因并修改后重新提交'
    default:
      return '未知状态'
  }
}

function getCanEdit(status: string) {
  return status === 'pending' || status === 'rejected' || status === 'approved'
}

function WebsiteCard({
  website,
  onDelete,
  isDeleting,
  onEdit,
}: {
  website: Website
  onDelete: (id: string) => void
  isDeleting: string | null
  onEdit: (website: Website) => void
}) {
  const canEdit = getCanEdit(website.approvalStatus)

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={website.iconUrl || '/default-icon.png'}
              alt={website.name}
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.src = '/default-icon.png'
              }}
            />
            <div>
              <CardTitle className="text-lg">{website.name}</CardTitle>
              <a
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm flex items-center"
              >
                {website.url}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
          {getStatusBadge(website.approvalStatus)}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">
              <strong>描述:</strong> {website.description}
            </p>
          </div>

          {website.tags && website.tags.length > 0 && (
            <div>
              <strong className="text-gray-600">标签:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {website.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {website.categories && website.categories.length > 0 && (
            <div className="flex items-center space-x-2">
              <strong className="text-gray-600">分类:</strong>
              <div className="flex flex-wrap gap-2">
                {website.categories.map((cat: any) => (
                  <Badge
                    key={cat.category.id}
                    className="bg-blue-100 text-blue-800 text-xs"
                  >
                    {cat.category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            {getStatusDescription(website.approvalStatus)}
          </div>

          {website.approvalStatus === 'rejected' && website.rejectReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm font-medium text-red-600 mb-1">
                拒绝原因:
              </div>
              <p className="text-sm text-red-700">{website.rejectReason}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-gray-500">
              提交时间: {new Date(website.createdAt).toLocaleString('zh-CN')}
            </span>

            <div className="flex space-x-2">
              {website.approvalStatus === 'approved' && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/#`} className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    查看网站
                  </Link>
                </Button>
              )}

              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(website)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  修改
                </Button>
              )}

              {canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      disabled={isDeleting === website.id}
                    >
                      {isDeleting === website.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      删除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        此操作将永久删除该网站申请，确定要继续吗？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(website.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UserWebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingWebsite, setEditingWebsite] = useState<WebsiteProps | null>(
    null
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalWebsites, setTotalWebsites] = useState(0)
  const router = useRouter()

  const loadWebsites = async (page: number = 1) => {
    try {
      const data = await getUserSubmittedWebsites(page, 10)
      if (data.websites) {
        setWebsites(data.websites)
        setTotalPages(data.totalPages || 0)
        setCurrentPage(data.currentPage || page)
        setTotalWebsites(data.total || 0)
      }
    } catch (error) {
      toast.error('加载网站列表失败')
      console.error('加载网站列表失败:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadWebsites()
  }, [])

  const handleDelete = async (websiteId: string) => {
    try {
      setIsDeleting(websiteId)
      await deleteUserWebsite(websiteId)
      toast.success('网站删除成功')
      await loadWebsites(currentPage) // 重新加载数据
    } catch (error: any) {
      toast.error(error.message || '删除失败')
      console.error('删除失败:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleEdit = (website: Website) => {
    // 转换 Website 数据为 WebsiteProps 格式
    const websiteProps = {
      ...website,
      iconUrl: website.iconUrl || '',
      createdAt: new Date(website.createdAt),
      likes: [],
      favorites: [],
      views: 0,
      hasFavorited: false,
      hasLiked: false,
      categories: website.categories.map((cat) => ({
        ...cat.category,
        icon: null,
      })),
    }
    setEditingWebsite(websiteProps)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingWebsite(null)
    loadWebsites() // 重新加载数据
  }

  const handleEditCancel = () => {
    setIsEditDialogOpen(false)
    setEditingWebsite(null)
  }

  const handleAdd = () => {
    setIsAddDialogOpen(true)
  }

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    loadWebsites() // 重新加载数据
  }

  const handleAddCancel = () => {
    setIsAddDialogOpen(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadWebsites()
      toast.success('列表已刷新')
    } catch (error) {
      // 错误已经在 loadWebsites 中处理
    } finally {
      setIsRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-8">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Fixed Header relative to page */}
        <div className="sticky top-0 z-10  mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                我的网站管理
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                管理您提交的网站，可以编辑、删除还未审核的网站。
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                <span>{isRefreshing ? '更新中...' : '更新状态'}</span>
              </Button>
              <Button
                className="flex items-center space-x-2"
                onClick={handleAdd}
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>添加新网站</span>
              </Button>
            </div>
          </div>
        </div>
        <div className="my-6 p-6 bg-blue-50 border-b rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">使用说明</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              <strong>待审批状态:</strong>{' '}
              网站已经提交，正在等待管理员审核，您可以修改或删除。
            </li>
            <li>
              <strong>已通过状态:</strong>{' '}
              网站审核通过，现在显示在网站列表中，可以查看详情或修改（修改后需要重新审核）。
            </li>
            <li>
              <strong>已拒绝状态:</strong>{' '}
              网站审核未通过，查看拒绝原因，修改后可以继续申请。
            </li>
            <li>
              <strong>编辑规则:</strong>{' '}
              只有审核前的网站（待审批和已拒绝状态）和审核通过的网站可以编辑。
            </li>
            <li>
              <strong>删除规则:</strong>{' '}
              只有审核前的网站可以删除，已通过的网站请联系管理员删除。
            </li>
          </ul>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-6">
          {websites.length === 0 ? (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  暂无网站管理记录
                </h3>
                <p className="text-gray-600 mb-4">
                  您还没有提交过网站，快去添加一个吧！
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6 pb-8">
              <div className="grid gap-6">
                {websites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    website={website}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                    onEdit={handleEdit}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    显示 {(currentPage - 1) * 10 + 1} -{' '}
                    {Math.min(currentPage * 10, totalWebsites)} 项，共{' '}
                    {totalWebsites} 项
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => {
                            if (currentPage > 1) {
                              loadWebsites(currentPage - 1)
                            }
                          }}
                          className={
                            currentPage <= 1
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>

                      {/* 页面数字 */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, index) => {
                          let pageNumber
                          if (totalPages <= 5) {
                            pageNumber = index + 1
                          } else if (currentPage <= 3) {
                            pageNumber = index + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + index
                          } else {
                            pageNumber = currentPage - 2 + index
                          }

                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => loadWebsites(pageNumber)}
                                isActive={pageNumber === currentPage}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => {
                            if (currentPage < totalPages) {
                              loadWebsites(currentPage + 1)
                            }
                          }}
                          className={
                            currentPage >= totalPages
                              ? 'pointer-events-none opacity-50'
                              : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>修改网站信息</DialogTitle>
          </DialogHeader>
          {editingWebsite && (
            <WebsiteForm
              website={editingWebsite}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>添加新网站</DialogTitle>
          </DialogHeader>
          <WebsiteForm onSuccess={handleAddSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
