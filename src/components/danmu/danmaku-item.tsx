'use client'

import { useEffect, useRef } from 'react'

interface DanmakuItemProps {
  id: string
  content: string
  author: string
  isAdmin: boolean
  top: number
  duration: number
  color: string
  backgroundColor: string
  fontSize: number
  onExit: (id: string) => void
}

export default function DanmakuItem({
  id,
  content,
  author,
  isAdmin,
  top,
  duration,
  color,
  backgroundColor,
  fontSize,
  onExit,
}: DanmakuItemProps) {
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!itemRef.current) return

    // 使用IntersectionObserver检测元素何时完全离开视口
    const observer = new IntersectionObserver(
      (entries) => {
        // 当元素完全离开视口时
        if (
          entries[0].intersectionRatio === 0 &&
          entries[0].boundingClientRect.right < 0
        ) {
          onExit(id)
        }
      },
      { threshold: 0 }
    )

    observer.observe(itemRef.current)

    return () => {
      observer.disconnect()
    }
  }, [id, onExit])

  return (
    <div
      ref={itemRef}
      className="danmaku-item px-3 py-1 rounded-full"
      style={{
        top: `${top}px`,
        color,
        backgroundColor,
        fontSize: `${fontSize}px`,
        fontWeight: isAdmin ? 'bold' : 'normal',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        animationDuration: `${duration}s`,
        zIndex: 50,
      }}
    >
      {isAdmin ? `【站长】${author}: ` : `${author}: `}
      {content}
    </div>
  )
}
