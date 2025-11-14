'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bold, Italic, Link, Image, Smile, Code } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  disabled?: boolean
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '在这里输入内容...',
  minHeight = '120px',
  disabled = false,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  // Track selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (textareaRef.current) {
        setSelectionStart(textareaRef.current.selectionStart)
        setSelectionEnd(textareaRef.current.selectionEnd)
      }
    }

    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('select', handleSelectionChange)
      textarea.addEventListener('click', handleSelectionChange)
      textarea.addEventListener('keyup', handleSelectionChange)
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('select', handleSelectionChange)
        textarea.removeEventListener('click', handleSelectionChange)
        textarea.removeEventListener('keyup', handleSelectionChange)
      }
    }
  }, [])

  const insertFormatting = (prefix: string, suffix: string) => {
    if (disabled) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newValue =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end)

    onChange(newValue)

    // Set focus back to textarea and position cursor after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos =
        start + prefix.length + selectedText.length + suffix.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertEmoji = (emoji: string) => {
    if (disabled) return

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart

    const newValue = value.substring(0, start) + emoji + value.substring(start)

    onChange(newValue)

    // Set focus back to textarea and position cursor after insertion
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + emoji.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const insertLink = () => {
    const url = prompt('请输入链接地址:', 'https://')
    if (url) {
      const text = value.substring(selectionStart, selectionEnd) || '链接文字'
      insertFormatting(`[${text}](`, `)`)
    }
  }

  const insertImage = () => {
    const url = prompt('请输入图片地址:', 'https://')
    if (url) {
      const alt = value.substring(selectionStart, selectionEnd) || '图片描述'
      insertFormatting(`![${alt}](`, `)`)
    }
  }

  const emojis = [
    '😊',
    '👍',
    '❤️',
    '🎉',
    '🔥',
    '😂',
    '🤔',
    '👏',
    '🙏',
    '✨',
    '🌟',
    '💯',
    '🤣',
    '😍',
    '🥰',
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertFormatting('**', '**')}
                disabled={disabled}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>加粗</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertFormatting('*', '*')}
                disabled={disabled}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>斜体</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={insertLink}
                disabled={disabled}
              >
                <Link className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>插入链接</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={insertImage}
                disabled={disabled}
                aria-label="插入图片"
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>插入图片</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertFormatting('`', '`')}
                disabled={disabled}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>代码</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full`}
        style={{ minHeight }}
        disabled={disabled}
      />

      <div className="text-xs text-gray-500">
        支持 Markdown 格式: **加粗**, *斜体*, `代码`, [链接](url), ![图片](url)
      </div>
    </div>
  )
}
