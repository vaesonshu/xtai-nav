import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import { getUserInfo } from '@/lib/user-actions'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function currentDate(
  date = new Date(),
  customFormat = 'YYYY-MM-DD HH:mm:ss'
) {
  return dayjs(date).format(customFormat)
}

// 生成随机但美观的颜色
export function generateRandomColor(): {
  textColor: string
  backgroundColor: string
} {
  // 预定义的颜色组合，确保文字和背景搭配良好
  const colorPairs = [
    { textColor: '#1e3a8a', backgroundColor: 'rgba(239, 246, 255, 0.85)' }, // 蓝色
    { textColor: '#065f46', backgroundColor: 'rgba(236, 253, 245, 0.85)' }, // 绿色
    { textColor: '#7c2d12', backgroundColor: 'rgba(255, 237, 213, 0.85)' }, // 橙色
    { textColor: '#831843', backgroundColor: 'rgba(253, 242, 248, 0.85)' }, // 粉色
    { textColor: '#581c87', backgroundColor: 'rgba(250, 245, 255, 0.85)' }, // 紫色
    { textColor: '#0c4a6e', backgroundColor: 'rgba(240, 249, 255, 0.85)' }, // 天蓝色
    { textColor: '#713f12', backgroundColor: 'rgba(254, 252, 232, 0.85)' }, // 黄色
    { textColor: '#881337', backgroundColor: 'rgba(255, 241, 242, 0.85)' }, // 红色
    { textColor: '#365314', backgroundColor: 'rgba(247, 254, 231, 0.85)' }, // 草绿色
    { textColor: '#1e1b4b', backgroundColor: 'rgba(238, 242, 255, 0.85)' }, // 靛蓝色
  ]

  // 随机选择一个颜色组合
  const randomIndex = Math.floor(Math.random() * colorPairs.length)
  return colorPairs[randomIndex]
}

// 管理员固定颜色
export const adminColor = {
  textColor: '#9c4221',
  backgroundColor: 'rgba(254, 243, 199, 0.85)',
}

// 判断是否是管理员
export async function isAdmin(userId: string) {
  const userInfo = await getUserInfo(userId)
  return userInfo!.role === 'ADMIN'
}
