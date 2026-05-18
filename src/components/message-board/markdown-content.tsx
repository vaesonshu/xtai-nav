'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MarkdownContentProps {
  content: string
  className?: string
}

export default function MarkdownContent({
  content,
  className = '',
}: MarkdownContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>
  }

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown
        // GFM：表格、删除线、任务列表、自动链接等（见 remark-gfm）
        remarkPlugins={[remarkGfm]}
        components={{
          // 外链新窗口打开；浅色/暗色下链接对比度分开处理
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            />
          ),
          img: ({ node, ...props }) => (
            <Image
              src={props.src || ''}
              alt={props.alt || 'Image'}
              width={800}
              height={600}
              className="max-w-full h-auto rounded-md my-2"
              unoptimized
            />
          ),
          // 宽表格横向滚动，避免撑破气泡
          table: ({ node, children, ...props }) => (
            <div className="my-3 max-w-full overflow-x-auto not-prose">
              <table
                className="w-full min-w-[280px] border-collapse border border-border text-sm"
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/60" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-border px-2 py-1.5 text-left font-semibold"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-border px-2 py-1.5 align-top"
              {...props}
            />
          ),
          // 代码块容器（与行内 code 区分）
          pre: ({ node, children, ...props }) => (
            <pre
              className="my-2 overflow-x-auto rounded-md bg-muted p-3 text-sm not-prose"
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ node, className, children, ...props }) => {
            const { inline, ...domProps } = props as typeof props & {
              inline?: boolean
            }
            const isInline = inline === true
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1 py-0.5 text-sm not-prose"
                  {...domProps}
                >
                  {children}
                </code>
              )
            }
            return (
              <code className={cn('text-sm', className)} {...domProps}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
