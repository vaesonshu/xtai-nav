'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
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
import { House, Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@clerk/nextjs'
import { isAdmin } from '@/lib/utils'
import NotAuthorized from '@/components/not-authorized'

interface Log {
  id: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LogsPage() {
  const router = useRouter()
  const { errorToast } = useToast()
  const { user } = useUser()
  const [logs, setLogs] = useState<Log[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    createdAt: '',
  })

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (user?.id) {
          const adminStatus = await isAdmin(user.id)
          setIsAdminUser(adminStatus)
        }
      } catch (error) {
        console.error('检查管理员状态失败:', error)
        setIsAdminUser(false)
      }
    }
    checkAdmin()
  }, [user?.id])

  // Fetch logs
  const fetchLogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        })
        if (searchTerm) params.append('search', searchTerm)

        const response = await fetch(`/api/logs?${params}`)
        const data = await response.json()

        if (response.ok) {
          setLogs(data.logs)
          console.log('获取日志成功:', data)
          setPagination(data.pagination)
        } else {
          errorToast('获取日志失败', { description: data.error })
        }
      } catch (error) {
        console.error('获取日志失败:', error)
        errorToast('获取日志失败', { description: '网络错误，请稍后重试' })
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, errorToast]
  )

  useEffect(() => {
    if (isAdminUser) {
      fetchLogs(currentPage)
    }
  }, [isAdminUser, currentPage, searchTerm, fetchLogs])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchLogs(1)
  }

  const handleCreateLog = async () => {
    try {
      const response = await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          createdAt: formData.createdAt || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        errorToast('创建成功', { description: '日志已创建' })
        setIsCreateDialogOpen(false)
        setFormData({ title: '', content: '', createdAt: '' })
        fetchLogs(currentPage)
      } else {
        errorToast('创建失败', { description: data.error })
      }
    } catch (error) {
      console.error('创建日志失败:', error)
      errorToast('创建失败', { description: '网络错误，请稍后重试' })
    }
  }

  const handleEditLog = async () => {
    if (!editingLog) return

    try {
      const response = await fetch(`/api/logs?id=${editingLog.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          createdAt: formData.createdAt || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        errorToast('更新成功', { description: '日志已更新' })
        setIsEditDialogOpen(false)
        setEditingLog(null)
        setFormData({ title: '', content: '', createdAt: '' })
        fetchLogs(currentPage)
      } else {
        errorToast('更新失败', { description: data.error })
      }
    } catch (error) {
      console.error('更新日志失败:', error)
      errorToast('更新失败', { description: '网络错误，请稍后重试' })
    }
  }

  const handleDeleteLog = async (id: string) => {
    try {
      const response = await fetch(`/api/logs?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        errorToast('删除成功', { description: '日志已删除' })
        fetchLogs(currentPage)
      } else {
        errorToast('删除失败', { description: data.error })
      }
    } catch (error) {
      console.error('删除日志失败:', error)
      errorToast('删除失败', { description: '网络错误，请稍后重试' })
    }
  }

  const handleTogglePin = async (id: string) => {
    try {
      const response = await fetch(`/api/logs?id=${id}`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (response.ok) {
        errorToast('操作成功', { description: '置顶状态已更新' })
        fetchLogs(currentPage)
      } else {
        errorToast('操作失败', { description: data.error })
      }
    } catch (error) {
      console.error('切换置顶状态失败:', error)
      errorToast('操作失败', { description: '网络错误，请稍后重试' })
    }
  }

  const openEditDialog = (log: Log) => {
    setEditingLog(log)
    const date = new Date(log.createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
    setFormData({
      title: log.title,
      content: log.content,
      createdAt: localDateTime, // 使用本地时间格式
    })
    setIsEditDialogOpen(true)
  }

  if (!isAdminUser && !loading) {
    return <NotAuthorized />
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                日志管理
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                查看和管理更新日志记录。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href={'/admin'}>
                  <House className="mr-2 h-4 w-4" />
                  返回管理
                </Link>
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新增日志
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增日志</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">标题</label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="输入日志标题"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">内容</label>
                      <Textarea
                        value={formData.content}
                        className="h-[120px]"
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="输入日志内容"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        创建时间（可选）
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.createdAt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            createdAt: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleCreateLog} className="w-full">
                      创建
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="搜索标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                搜索
              </Button>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>日志列表</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无日志记录
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>置顶</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>内容</TableHead>
                      <TableHead>时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge
                            variant={log.isPinned ? 'default' : 'secondary'}
                          >
                            {log.isPinned ? '置顶' : '普通'}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={log.title}
                        >
                          {log.title}
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={log.content}
                        >
                          {log.content}
                        </TableCell>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString('zh-CN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePin(log.id)}
                            >
                              {log.isPinned ? '取消置顶' : '置顶'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(log)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除这条日志记录吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteLog(log.id)}
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      显示 {(pagination.page - 1) * pagination.limit + 1} -{' '}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{' '}
                      条，共 {pagination.total} 条
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={pagination.page === 1}
                      >
                        上一页
                      </Button>
                      <span className="text-sm">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(pagination.totalPages, prev + 1)
                          )
                        }
                        disabled={pagination.page === pagination.totalPages}
                      >
                        下一页
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑日志</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">标题</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="输入日志标题"
                />
              </div>
              <div>
                <label className="text-sm font-medium">内容</label>
                <Textarea
                  value={formData.content}
                  className="h-[120px]"
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="输入日志内容"
                />
              </div>
              <div>
                <label className="text-sm font-medium">创建时间</label>
                <Input
                  type="datetime-local"
                  value={formData.createdAt}
                  onChange={(e) =>
                    setFormData({ ...formData, createdAt: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleEditLog} className="w-full">
                更新
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
