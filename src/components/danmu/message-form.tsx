'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import type { Message } from '@/types/message'

interface MessageFormProps {
  onSubmit: (message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>
}

export default function MessageForm({ onSubmit }: MessageFormProps) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !author.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        content,
        author,
        isAdmin,
      })

      // 清空内容，保留作者和身份
      setContent('')
    } catch (error) {
      console.error('Error submitting message:', error)
      setError('发送失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 md:w-1/4">
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="你的昵称"
            required
            className="bg-white border-slate-200"
          />
        </div>

        <div className="flex-grow flex items-center gap-2">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入留言内容..."
            required
            className="bg-white border-slate-200"
          />
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
            disabled={isSubmitting}
          >
            {isSubmitting ? '发送中...' : '发送弹幕'}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:w-auto">
          <Switch
            id="admin-mode"
            checked={isAdmin}
            onCheckedChange={setIsAdmin}
          />
          <Label
            htmlFor="admin-mode"
            className="text-slate-700 whitespace-nowrap"
          >
            站长模式
          </Label>
        </div>
      </div>
    </form>
  )
}
