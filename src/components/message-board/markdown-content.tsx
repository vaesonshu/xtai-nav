'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

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
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            />
          ),
          img: ({ node, ...props }) => (
            <img
              {...props}
              className="max-w-full h-auto rounded-md my-2"
              loading="lazy"
              alt={props.alt || 'Image'}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              {...props}
              className="bg-gray-100 px-1 py-0.5 rounded text-sm"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
