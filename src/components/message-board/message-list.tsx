'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  deleteMessage,
  likeMessage,
  togglePinMessage,
  getReplies,
} from '@/lib/message-actions'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import {
  Trash2,
  User,
  ShieldAlert,
  Heart,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Pin,
  PinOff,
} from 'lucide-react'
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
import MessageForm from './message-form'
import MarkdownContent from './markdown-content'

interface Message {
  id: string
  content: string
  author: string
  isAdmin: boolean
  createdAt: Date
  likes: number
  isPinned: boolean
  parentId: string | null
  avatarUrl?: string | null
  replies?: Message[]
  _count?: {
    replies: number
  }
}

interface MessageListPagination {
  total: number
  pages: number
  current: number
}

interface MessageListProps {
  messages: Message[]
  pagination: MessageListPagination
  isAdmin: boolean
  parentId?: string | null
  isReplies?: boolean
}

export default function MessageList({
  messages,
  pagination,
  isAdmin,
  parentId = null,
  isReplies = false,
}: MessageListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, Message[]>
  >({})
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>(
    {}
  )
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyAuthor, setReplyAuthor] = useState<string>('')
  const router = useRouter()
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
        success('删除成功', {
          description: '留言已成功删除',
        })
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

  async function handleLike(id: string) {
    try {
      await likeMessage(id)
    } catch (error) {
      errorToast('点赞失败', {
        description: '操作失败，请稍后再试',
      })
    }
  }

  async function handleTogglePin(id: string) {
    try {
      const result = await togglePinMessage(id)

      if (!result.success) {
        errorToast('操作失败', {
          description: '置顶操作失败',
        })
      }
    } catch (error) {
      errorToast('操作失败', {
        description: '置顶操作失败，请稍后再试',
      })
    }
  }

  async function loadAllReplies(messageId: string) {
    setLoadingReplies((prev) => ({ ...prev, [messageId]: true }))

    try {
      const result = await getReplies(messageId)

      if (result.success) {
        setExpandedReplies((prev) => ({
          ...prev,
          [messageId]: result.replies ?? [],
        }))
      } else {
        errorToast('加载回复失败', {
          description: '无法加载回复',
        })
      }
    } catch (error) {
      errorToast('加载回复失败', {
        description: '无法加载回复',
      })
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  function handleReply(messageId: string, author: string) {
    setReplyingTo(messageId)
    setReplyAuthor(author)
  }

  function handleCancelReply() {
    setReplyingTo(null)
    setReplyAuthor('')
  }

  function handleReplySuccess() {
    setReplyingTo(null)
    setReplyAuthor('')

    // Reload the replies for this message
    if (replyingTo) {
      loadAllReplies(replyingTo)
    }
  }

  function handlePageChange(page: number) {
    // If we're viewing replies, we need to handle pagination differently
    if (isReplies && parentId) {
      // This would be handled by the parent component
      return
    }

    // For main message list, we use URL params
    const params = new URLSearchParams()
    params.set('page', page.toString())
    router.push(`/message-board?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 rounded-lg ${
            message.isPinned
              ? 'bg-amber-50 border border-amber-100'
              : message.isAdmin
                ? 'bg-red-50 border border-red-100'
                : 'bg-white border border-gray-100'
          }`}
        >
          {message.isPinned && (
            <div className="flex items-center gap-1 text-amber-600 text-xs font-medium mb-2">
              <Pin className="h-3 w-3" />
              置顶留言
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {message.avatarUrl ? (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={message.avatarUrl} alt={message.author} />
                  <AvatarFallback>
                    {message.author.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div
                  className={`p-2 rounded-full ${message.isAdmin ? 'bg-red-100' : 'bg-blue-100'}`}
                >
                  {message.isAdmin ? (
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                  ) : (
                    <User className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              )}
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

            <div className="flex items-center gap-1">
              {isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-amber-500"
                    onClick={() => handleTogglePin(message.id)}
                  >
                    {message.isPinned ? (
                      <PinOff className="h-4 w-4" />
                    ) : (
                      <Pin className="h-4 w-4" />
                    )}
                  </Button>

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
                </>
              )}
            </div>
          </div>

          <div className="mt-3 text-gray-700">
            <MarkdownContent content={message.content} />
          </div>

          {/* <div className="mt-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 flex items-center gap-1"
              onClick={() => handleLike(message.id)}
            >
              <Heart className="h-4 w-4" />
              <span>{message.likes > 0 ? message.likes : '点赞'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500 flex items-center gap-1"
              onClick={() => handleReply(message.id, message.author)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>回复</span>
            </Button>
          </div> */}

          {/* Reply form */}
          {replyingTo === message.id && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <MessageForm
                isLoggedIn={false}
                isAdmin={isAdmin}
                userName=""
                parentId={message.id}
                parentAuthor={replyAuthor}
                onSuccess={handleReplySuccess}
                onCancel={handleCancelReply}
                isReply={true}
              />
            </div>
          )}

          {/* Replies section */}
          {message._count && message._count.replies > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <div className="mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 flex items-center gap-1"
                  onClick={() => {
                    if (expandedReplies[message.id]) {
                      // If already expanded, collapse
                      const newExpanded = { ...expandedReplies }
                      delete newExpanded[message.id]
                      setExpandedReplies(newExpanded)
                    } else {
                      // Otherwise load all replies
                      loadAllReplies(message.id)
                    }
                  }}
                >
                  {loadingReplies[message.id] ? (
                    <span className="flex items-center gap-1">
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      加载回复中...
                    </span>
                  ) : expandedReplies[message.id] ? (
                    <span className="flex items-center gap-1">
                      <ChevronUp className="h-4 w-4" />
                      收起回复 ({message._count.replies})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <ChevronDown className="h-4 w-4" />
                      查看回复 ({message._count.replies})
                    </span>
                  )}
                </Button>
              </div>

              {/* Show first 3 replies or all expanded replies */}
              {expandedReplies[message.id] ? (
                expandedReplies[message.id].length > 0 ? (
                  <div className="space-y-3">
                    {expandedReplies[message.id].map((reply) => (
                      <div key={reply.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          {reply.avatarUrl ? (
                            <Avatar className="h-7 w-7">
                              <AvatarImage
                                src={reply.avatarUrl}
                                alt={reply.author}
                              />
                              <AvatarFallback>
                                {reply.author.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div
                              className={`p-1.5 rounded-full ${reply.isAdmin ? 'bg-red-100' : 'bg-blue-100'}`}
                            >
                              {reply.isAdmin ? (
                                <ShieldAlert className="h-4 w-4 text-red-500" />
                              ) : (
                                <User className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                          )}
                          <div>
                            <p
                              className={`text-sm font-medium ${reply.isAdmin ? 'text-red-600' : 'text-blue-600'}`}
                            >
                              {reply.author}
                              {reply.isAdmin && (
                                <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                  管理员
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(reply.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </p>
                          </div>

                          {isAdmin && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-red-500 ml-auto"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    您确定要删除这条回复吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(reply.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    {deletingId === reply.id
                                      ? '删除中...'
                                      : '删除'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-700">
                          <MarkdownContent
                            content={reply.content}
                            className="prose-sm"
                          />
                        </div>

                        {/* <div className="mt-2 flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-red-500 flex items-center gap-1 h-7 px-2 text-xs"
                            onClick={() => handleLike(reply.id)}
                          >
                            <Heart className="h-3 w-3" />
                            <span>
                              {reply.likes > 0 ? reply.likes : '点赞'}
                            </span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-blue-500 flex items-center gap-1 h-7 px-2 text-xs"
                            onClick={() =>
                              handleReply(message.id, reply.author)
                            }
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>回复</span>
                          </Button>
                        </div> */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">暂无回复</p>
                )
              ) : message.replies && message.replies.length > 0 ? (
                <div className="space-y-3">
                  {message.replies.map((reply) => (
                    <div key={reply.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        {reply.avatarUrl ? (
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={reply.avatarUrl}
                              alt={reply.author}
                            />
                            <AvatarFallback>
                              {reply.author.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div
                            className={`p-1.5 rounded-full ${reply.isAdmin ? 'bg-red-100' : 'bg-blue-100'}`}
                          >
                            {reply.isAdmin ? (
                              <ShieldAlert className="h-4 w-4 text-red-500" />
                            ) : (
                              <User className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        )}
                        <p
                          className={`text-sm font-medium ${reply.isAdmin ? 'text-red-600' : 'text-blue-600'}`}
                        >
                          {reply.author}
                          {reply.isAdmin && (
                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                              管理员
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {reply.content}
                      </div>
                    </div>
                  ))}

                  {message._count.replies > 3 && (
                    <p className="text-sm text-gray-500">
                      还有 {message._count.replies - 3} 条回复未显示
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ))}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.current > 1) {
                    handlePageChange(pagination.current - 1)
                  }
                }}
                className={
                  pagination.current === 1
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let pageNum: number

              if (pagination.pages <= 5) {
                pageNum = i + 1
              } else if (pagination.current <= 3) {
                pageNum = i + 1
              } else if (pagination.current >= pagination.pages - 2) {
                pageNum = pagination.pages - 4 + i
              } else {
                pageNum = pagination.current - 2 + i
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(pageNum)
                    }}
                    isActive={pagination.current === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            {pagination.pages > 5 &&
              pagination.current < pagination.pages - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(pagination.pages)
                      }}
                    >
                      {pagination.pages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.current < pagination.pages) {
                    handlePageChange(pagination.current + 1)
                  }
                }}
                className={
                  pagination.current === pagination.pages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
