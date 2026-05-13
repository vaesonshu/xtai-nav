import type { CSSProperties } from 'react'

/** 是否为 CSS 渐变（线性 / 径向 / 圆锥等） */
export function isBannerGradientCss(value: string): boolean {
  const v = value.trim().toLowerCase()
  return (
    v.includes('linear-gradient') ||
    v.includes('radial-gradient') ||
    v.includes('conic-gradient')
  )
}

/** 通告条外层背景：纯色与渐变统一使用 background */
export function bannerBarBackgroundStyle(
  raw: string | undefined,
  fallback: string
): CSSProperties {
  const bg = (raw?.trim() || fallback).trim()
  return { background: bg }
}

/**
 * 左侧 HTML 内容区：纯色用 color；渐变字用 background-clip:text
 * （内嵌 HTML 里的链接等仍可能受渐变字影响，属 CSS 限制）
 */
export function bannerMainContentStyle(
  raw: string | undefined,
  fallback: string
): CSSProperties {
  const tc = (raw?.trim() || fallback).trim()
  if (isBannerGradientCss(tc)) {
    return {
      backgroundImage: tc,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    }
  }
  return { color: tc }
}

/** 右侧「查看」与关闭按钮：正文为渐变时用纯色兜底保证可读 */
export function bannerAuxiliaryColor(
  rawTextColor: string | undefined,
  fallback: string
): string {
  const tc = rawTextColor?.trim() || ''
  if (isBannerGradientCss(tc)) return fallback
  return tc || fallback
}

/** 解析线性渐变（支持 rgb/rgba 中含逗号的两端色标） */
export function parseLinearGradient(css: string): {
  angle: number
  c1: string
  c2: string
} | null {
  const trimmed = css.trim()
  const low = trimmed.toLowerCase()
  if (!low.startsWith('linear-gradient')) return null
  const open = trimmed.indexOf('(')
  const close = trimmed.lastIndexOf(')')
  if (open === -1 || close === -1 || close <= open) return null
  const inner = trimmed.slice(open + 1, close).trim()
  const degMatch = inner.match(/^(\d+)deg\s*,\s*/i)
  if (!degMatch) return null
  const angle = Number(degMatch[1])
  const rest = inner.slice(degMatch[0].length).trim()

  let depth = 0
  let splitIdx = -1
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      splitIdx = i
      break
    }
  }
  if (splitIdx === -1) return null
  const c1 = rest.slice(0, splitIdx).trim()
  const c2 = rest.slice(splitIdx + 1).trim()
  if (!c1 || !c2) return null
  return { angle, c1, c2 }
}

/** 解析径向渐变 circle at center（支持 rgb/rgba） */
export function parseRadialGradient(
  css: string
): { c1: string; c2: string } | null {
  const trimmed = css.trim()
  const low = trimmed.toLowerCase()
  if (!low.startsWith('radial-gradient')) return null
  const open = trimmed.indexOf('(')
  const close = trimmed.lastIndexOf(')')
  if (open === -1 || close === -1 || close <= open) return null
  const inner = trimmed.slice(open + 1, close).trim()
  const head = /^circle\s+at\s+center\s*,\s*/i
  const m = inner.match(head)
  if (!m) return null
  const rest = inner.slice(m[0].length).trim()

  let depth = 0
  let splitIdx = -1
  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i]
    if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      splitIdx = i
      break
    }
  }
  if (splitIdx === -1) return null
  const c1 = rest.slice(0, splitIdx).trim()
  const c2 = rest.slice(splitIdx + 1).trim()
  if (!c1 || !c2) return null
  return { c1, c2 }
}

/** 规范化 6 位 hex，非法则返回 fallback */
export function normalizeSolidHex(input: string, fallback: string): string {
  const t = input.trim()
  if (/^#[0-9A-Fa-f]{6}$/i.test(t)) return t.toLowerCase()
  if (/^#[0-9A-Fa-f]{3}$/i.test(t)) {
    const x = t
      .slice(1)
      .split('')
      .map((ch) => ch + ch)
      .join('')
    return `#${x.toLowerCase()}`
  }
  return fallback
}

/** 当前值对应的 Tab：纯色 / 线性 / 径向 */
export type BannerColorTabKind = 'solid' | 'linear' | 'radial'

export function detectBannerColorTab(value: string): BannerColorTabKind {
  const s = value.trim().toLowerCase()
  if (s.includes('linear-gradient')) return 'linear'
  if (s.includes('radial-gradient')) return 'radial'
  return 'solid'
}
