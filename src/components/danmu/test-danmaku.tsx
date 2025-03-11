'use client'

import { useEffect, useState } from 'react'

export default function TestDanmaku() {
  const [showTest, setShowTest] = useState(false)

  useEffect(() => {
    // 组件挂载后显示测试弹幕
    setShowTest(true)

    // 30秒后隐藏测试弹幕
    const timer = setTimeout(() => {
      setShowTest(false)
    }, 30000)

    return () => clearTimeout(timer)
  }, [])

  if (!showTest) return null

  return (
    <div
      className="fixed px-3 py-1 bg-red-100 text-red-800 rounded-full"
      style={{
        top: '50%',
        left: 0,
        whiteSpace: 'nowrap',
        animation: 'danmaku-scroll 15s linear forwards',
        zIndex: 9999,
      }}
    >
      这是一条测试弹幕，如果你能看到它在移动，说明动画效果正常工作！
    </div>
  )
}
