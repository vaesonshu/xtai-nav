'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircle } from 'lucide-react'
import Image from 'next/image'
import { Fireworks } from 'fireworks-js'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/auth-client'
import { createOrUpdateUser } from '@/lib/user-actions'

export default function DashboardPage() {
  // 使用原始的 useSession hook，可以获得加载状态
  const { data: session, isPending, error } = useSession()
  const router = useRouter()
  const [progress, setProgress] = useState(100)
  const totalTime = 3000

  // 明确指定 fireworksRef 的类型为 Fireworks | null
  const fireworksRef = useRef<Fireworks | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null) // 为容器指定 HTMLDivElement 类型

  const userInfo = session?.user
  const isSignedIn = !!userInfo?.id
  const isLoading = isPending // 明确标识加载状态

  useEffect(() => {
    console.log('Session state:', { session, isLoading, isSignedIn, userInfo })

    // 如果仍在加载中，跳过处理
    if (isLoading) {
      return
    }

    // 加载完成后，如果用户未登录，重定向到首页
    if (!isSignedIn) {
      router.push('/')
      return
    }

    // 用户已登录，处理登录后的逻辑
    createOrUpdateUser().catch((err) =>
      console.error('Failed to create/update user:', err)
    )

    // 初始化礼花效果
    if (containerRef.current && !fireworksRef.current) {
      fireworksRef.current = new Fireworks(containerRef.current, {
        // autoresize: true,
        // opacity: 0.5,
        // acceleration: 1.05,
        // friction: 0.97,
        // gravity: 1.5,
        // particles: 50,
        // explosion: 5,

        autoresize: true,
        opacity: 1.0, // 提高透明度到最大，确保粒子在浅色背景上清晰
        acceleration: 1.05, // 略微增加加速度，增强动态感
        friction: 0.95,
        gravity: 1.7, // 增加重力，让粒子下落更自然
        particles: 100, // 增加粒子数量，营造密集效果
        traceLength: 4, // 延长尾迹，增强视觉冲击
        traceSpeed: 12,
        explosion: 10, // 增强爆炸强度，适合浅色背景
        mouse: { click: false, move: false, max: 1 },
        delay: { min: 25, max: 50 }, // 缩短延迟，增加频率
        hue: { min: 0, max: 360 }, // 全色调范围，保持多彩
        brightness: { min: 60, max: 90 }, // 调整亮度范围，适配浅色背景
        decay: { min: 0.02, max: 0.04 }, // 加快衰减，粒子消失更快
      })
      // 确保 fireworksRef.current 已赋值后再调用 start
      if (fireworksRef.current) {
        fireworksRef.current.start()
        setTimeout(() => {
          if (fireworksRef.current) {
            fireworksRef.current.stop()
          }
        }, 5000)
      }
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, totalTime - elapsed)
      setProgress((remaining / totalTime) * 100)

      if (remaining <= 0) {
        clearInterval(interval)
        router.push('/')
      }
    }, 50)

    return () => {
      clearInterval(interval)
      if (fireworksRef.current) {
        fireworksRef.current.stop()
      }
    }
  }, [isLoading, isSignedIn, userInfo])

  // 计算动态颜色
  const getDynamicColor = () => {
    if (progress > 66) return '#2dd4bf' // teal-600
    if (progress > 33) return '#3b82f6' // blue-500
    return '#ef4444' // red-500
  }

  // 处理不同的状态
  if (isLoading) {
    // 正在加载用户信息
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-blue-100">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="10"
              strokeDasharray="141.37 141.37"
              strokeLinecap="round"
            />
          </svg>
          <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    // 已确认未登录，用户将被重定向，但在此之前暂时显示
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-600">
            <UserCircle className="w-full h-full" />
          </div>
          <p className="text-gray-600">未登录，即将重定向...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-100 to-blue-100">
      {/* 礼花容器 */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{ pointerEvents: 'none' }} // 防止礼花层拦截点击事件
      />
      <Card className="w-full max-w-lg shadow-lg bg-white/95 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            欢迎, {userInfo?.name || 'User'}!
          </CardTitle>
          <CardDescription className="text-gray-600">
            您已登录成功！开启您的精彩 AI 旅程吧！
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="flex items-center space-x-4 animate-fade-in">
            {userInfo?.image ? (
              <Image
                src={userInfo.image}
                alt="Profile"
                className="h-16 w-16 rounded-full border-2 border-teal-200 shadow-md"
                width={64}
                height={64}
              />
            ) : (
              <UserCircle className="h-16 w-16 text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-xl text-gray-800">
                {userInfo?.name || 'User'}
              </p>
              <p className="text-sm text-gray-500">{userInfo?.email}</p>
            </div>
          </div>

          {/* 圆形进度条 */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getDynamicColor()} // 与文字颜色同步
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={(283 * (100 - progress)) / 100}
                strokeLinecap="round"
                className="transition-all duration-50 ease-linear"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={cn(
                  'text-xl font-bold animate-pulse-scale',
                  progress > 66
                    ? 'text-teal-600'
                    : progress > 33
                      ? 'text-blue-500'
                      : 'text-red-500'
                )}
              >
                {Math.ceil(progress / 33)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 自定义CSS动画 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseScale {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-spin {
          animation: spin 1.5s linear infinite;
        }
        .animate-pulse-scale {
          animation: pulseScale 0.8s infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
