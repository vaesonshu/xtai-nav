'use client'

import { useState, useRef } from 'react'
import { createMessage } from '@/lib/message-actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, Send, User, ShieldAlert } from 'lucide-react'

interface MessageFormProps {
  isLoggedIn: boolean
  isAdmin: boolean
  userName: string
}

export default function MessageForm({
  isLoggedIn,
  isAdmin,
  userName,
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
        success('留言成功！', {
          description: '感谢您的留言！',
        })
        setContent('')
        formRef.current?.reset()
      } else {
        errorToast('留言失败', {
          description: result.error || '发送留言时出现错误',
        })
      }
    } catch (error) {
      errorToast('留言失败', {
        description: '发送留言时出现错误',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {isAdmin ? (
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
          留言内容
        </label>
        <Textarea
          id="content"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在这里输入您的留言..."
          required
          className="min-h-[120px] w-full"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
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
              发送中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              发送留言
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
