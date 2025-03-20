'use client'

import { useState, useRef } from 'react'
import { createMessage } from '@/lib/message-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AlertCircle, Send, User, ShieldAlert, X } from 'lucide-react'
import RichTextEditor from './rich-text-editor'

interface MessageFormProps {
  isLoggedIn: boolean
  isAdmin: boolean
  userName: string
  avatarUrl?: string | null
  parentId?: string | null
  parentAuthor?: string
  onSuccess?: () => void
  onCancel?: () => void
  isReply?: boolean
}

export default function MessageForm({
  isLoggedIn,
  isAdmin,
  userName,
  avatarUrl = null,
  parentId = null,
  parentAuthor,
  onSuccess,
  onCancel,
  isReply = false,
}: MessageFormProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState(userName || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { success, errorToast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await createMessage(formData)

      if (result.success) {
        success(isReply ? '回复成功' : '留言成功', {
          description: isReply ? '您的回复已发送！' : '感谢您的留言！',
        })
        setContent('')
        formRef.current?.reset()

        if (onSuccess) {
          onSuccess()
        }
      } else {
        errorToast(isReply ? '回复失败' : '留言失败', {
          description: result.error || '发送时出现错误',
        })
      }
    } catch (error) {
      errorToast(isReply ? '回复失败' : '留言失败', {
        description: '发送时出现错误',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      {parentId && <input type="hidden" name="parentId" value={parentId} />}

      {isReply && parentAuthor && (
        <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 flex items-center justify-between">
          <span>
            回复给: <span className="font-medium">{parentAuthor}</span>
          </span>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 px-2 text-gray-500"
            >
              <X className="h-4 w-4 mr-1" />
              取消回复
            </Button>
          )}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt={author} />
              <AvatarFallback>
                {author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : isAdmin ? (
            <ShieldAlert className="h-5 w-5 text-red-500" />
          ) : isLoggedIn ? (
            <User className="h-5 w-5 text-blue-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-gray-500" />
          )}

          <label htmlFor="author" className="text-sm font-medium text-gray-700">
            {isAdmin ? '管理员昵称' : isLoggedIn ? '您的昵称' : '访客昵称'}
          </label>
        </div>

        <Input
          id="author"
          name="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder={isAdmin ? '管理员' : '请输入您的昵称'}
          required
          className="w-full"
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-gray-700">
          {isReply ? '回复内容' : '留言内容'}
        </label>

        <input type="hidden" name="content" value={content} />

        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder={
            isReply ? '在这里输入您的回复...' : '在这里输入您的留言...'
          }
          minHeight={isReply ? '80px' : '120px'}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`${isAdmin ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {isReply ? '回复中...' : '发送中...'}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {isReply ? '发送回复' : '发送留言'}
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
