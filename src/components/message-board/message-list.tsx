'use client'

import { useState } from 'react'
import { deleteMessage } from '@/lib/message-actions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Trash2, User, ShieldAlert } from 'lucide-react'
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

interface Message {
  id: string
  content: string
  author: string
  isAdmin: boolean
  createdAt: Date
}

interface MessageListProps {
  messages: Message[]
  isAdmin: boolean
}

export default function MessageList({ messages, isAdmin }: MessageListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { success, errorToast } = useToast()

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无留言，成为第一个留言的人吧！</p>
      </div>
    )
  }

  async function handleDelete(id: string) {
    setDeletingId(id)

    try {
      const result = await deleteMessage(id)

      if (result.success) {
        success('删除成功！')
      } else {
        errorToast('删除失败', {
          description: result.error || '删除留言时出现错误',
        })
      }
    } catch (error) {
      errorToast('删除失败', {
        description: '删除留言时出现错误',
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg ${
            message.isAdmin
              ? 'bg-red-50 border border-red-100'
              : 'bg-white border border-gray-100'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-full ${message.isAdmin ? 'bg-red-100' : 'bg-blue-100'}`}
              >
                {message.isAdmin ? (
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                ) : (
                  <User className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div>
                <p
                  className={`font-medium ${message.isAdmin ? 'text-red-600' : 'text-blue-600'}`}
                >
                  {message.author}
                  {message.isAdmin && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      管理员
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </p>
              </div>
            </div>

            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      您确定要删除这条留言吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(message.id)}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {deletingId === message.id ? '删除中...' : '删除'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="mt-3 text-gray-700 whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      ))}
    </div>
  )
}
