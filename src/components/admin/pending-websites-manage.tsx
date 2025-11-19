'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Check, X, Eye, Clock, Trash2, Loader2 } from 'lucide-react'
import {
  approveWebsite,
  rejectWebsite,
  getPendingWebsites,
} from '@/lib/actions'
import { toast } from 'sonner'

interface Website {
  id: string
  name: string
  url: string
  iconUrl: string
  description: string
  tags: string[]
  createdAt: string | Date
  approvalStatus: string
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

export default function PendingWebsitesManage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const loadPendingWebsites = async () => {
    try {
      const data = await getPendingWebsites()
      setWebsites(data)
    } catch (error) {
      toast.error('加载待审批网站失败')
      console.error('加载待审批网站失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPendingWebsites()
  }, [])

  const handleApprove = async (websiteId: string) => {
    try {
      setActionLoading(websiteId)
      await approveWebsite(websiteId)
      toast.success('网站已通过审批')
      loadPendingWebsites()
    } catch (error) {
      toast.error('审批失败')
      console.error('审批失败:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selectedWebsite || !rejectionReason.trim()) {
      toast.error('请填写拒绝原因')
      return
    }

    try {
      setActionLoading(selectedWebsite.id)
      await rejectWebsite(selectedWebsite.id, rejectionReason.trim())
      toast.success('网站已拒绝审批')
      setIsRejectDialogOpen(false)
      setRejectionReason('')
      setSelectedWebsite(null)
      loadPendingWebsites()
    } catch (error) {
      toast.error('拒绝审批失败')
      console.error('拒绝审批失败:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (websiteId: string) => {
    // For now, we'll just reject with a standard reason
    try {
      setActionLoading(websiteId)
      await rejectWebsite(websiteId, '管理员删除')
      toast.success('网站已删除')
      loadPendingWebsites()
    } catch (error) {
      toast.error('删除失败')
      console.error('删除失败:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectDialog = (website: Website) => {
    setSelectedWebsite(website)
    setIsRejectDialogOpen(true)
  }

  const openDetailDialog = (website: Website) => {
    setSelectedWebsite(website)
    setIsDetailDialogOpen(true)
  }

  if (loading) {
    return (
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
    )
  }

  if (websites.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无待审批的网站
          </h3>
          <p className="text-gray-600">目前没有用户提交的网站等待审批。</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {websites.map((website) => (
          <Card key={website.id} className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <img
                      src={website.iconUrl || '/default-icon.png'}
                      alt={website.name}
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/default-icon.png'
                      }}
                    />
                    <CardTitle className="text-lg">{website.name}</CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      待审批
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{website.url}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDetailDialog(website)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    查看详情
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading === website.id}
                      >
                        {actionLoading === website.id ? (
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
                          此操作将永久删除该网站申请。确定要继续吗？
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(website.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">{website.description}</p>

                <div className="flex flex-wrap gap-2">
                  {website.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {website.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {website.categories.map((cat) => (
                      <Badge
                        key={cat.category.id}
                        className="bg-blue-100 text-blue-800 text-xs"
                      >
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-gray-500">
                    提交时间:{' '}
                    {new Date(website.createdAt).toLocaleString('zh-CN')}
                  </span>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openRejectDialog(website)}
                      disabled={actionLoading === website.id}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      {actionLoading === website.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <X className="w-4 h-4 mr-1" />
                      )}
                      拒绝
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleApprove(website.id)}
                      disabled={actionLoading === website.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === website.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-1" />
                      )}
                      通过
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 拒绝原因对话框 */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝网站审批</DialogTitle>
          </DialogHeader>

          {selectedWebsite && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedWebsite.name}</h4>
                <p className="text-sm text-gray-600">{selectedWebsite.url}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  拒绝原因
                </label>
                <Textarea
                  placeholder="请说明拒绝该网站的原因..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false)
                setRejectionReason('')
                setSelectedWebsite(null)
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleReject}
              disabled={
                !rejectionReason.trim() || actionLoading === selectedWebsite?.id
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading === selectedWebsite?.id ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-1" />
              )}
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 网站详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>网站详情</DialogTitle>
          </DialogHeader>

          {selectedWebsite && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={selectedWebsite.iconUrl || '/default-icon.png'}
                  alt={selectedWebsite.name}
                  className="w-12 h-12 rounded"
                  onError={(e) => {
                    e.currentTarget.src = '/default-icon.png'
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedWebsite.name}
                  </h3>
                  <a
                    href={selectedWebsite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {selectedWebsite.url}
                  </a>
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-yellow-100 text-yellow-800"
                  >
                    待审批
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">网站描述</h4>
                <p className="text-gray-700">{selectedWebsite.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">标签</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWebsite.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedWebsite.categories.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">分类</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWebsite.categories.map((cat) => (
                      <Badge
                        key={cat.category.id}
                        className="bg-blue-100 text-blue-800"
                      >
                        {cat.category.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                提交时间:{' '}
                {new Date(selectedWebsite.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
