import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function currentDate(
  date = new Date(),
  customFormat = 'YYYY-MM-DD HH:mm:ss'
) {
  return dayjs(date).format(customFormat)
}
