'use client' // 确保在客户端运行

import { toast } from 'sonner' // 导入 sonner 的 toast 函数

// 定义 toast 选项类型（可选）
type ToastOptions = {
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

// 自定义 Hook
export function useToast() {
  // 成功通知
  const success = (message: string, options: ToastOptions = {}) => {
    toast.success(message, {
      description: options.description,
      action: options.action,
      duration: options.duration || 3000, // 默认 3 秒
    })
  }

  // 错误通知
  const errorToast = (message: string, options: ToastOptions = {}) => {
    toast.error(message, {
      description: options.description,
      action: options.action,
      duration: options.duration || 5000, // 默认 5 秒
    })
  }

  // 警告通知
  const warning = (message: string, options: ToastOptions = {}) => {
    toast.warning(message, {
      description: options.description,
      action: options.action,
      duration: options.duration || 4000, // 默认 4 秒
    })
  }

  // 自定义通知
  const custom = (message: string, options: ToastOptions = {}) => {
    toast(message, {
      ...options,
    })
  }

  return {
    success,
    errorToast,
    warning,
    custom,
  }
}
