/**
 * 网站 favicon 解析：直连站点图标 + 多 CDN 回退（避免仅依赖 Google s2 在部分地区不可用）
 */

/** 按优先级生成候选图标 URL（用于前端 img onError 链式尝试） */
export function buildFaviconFallbackUrls(
  pageUrl: string,
  preferredIconUrl?: string | null
): string[] {
  const list: string[] = []
  const p = preferredIconUrl?.trim()
  if (p) list.push(p)

  let host: string
  let origin: string
  try {
    const u = new URL(pageUrl)
    host = u.hostname
    origin = u.origin
  } catch {
    return list.length ? list : []
  }

  const extras = [
    `${origin}/favicon.ico`,
    `${origin}/favicon-32x32.png`,
    `https://icons.duckduckgo.com/ip3/${host}.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
    `https://unavatar.io/${encodeURIComponent(host)}`,
  ]
  for (const e of extras) {
    if (!list.includes(e)) list.push(e)
  }
  return list
}

/**
 * 服务端探测：依次 HEAD 候选地址，返回首个像图片的 URL；均失败则返回 DuckDuckGo（多数环境下 img 仍可用）
 */
export async function resolveBestFaviconUrl(pageUrl: string): Promise<string> {
  const candidates = buildFaviconFallbackUrls(pageUrl)
  if (candidates.length === 0) return ''

  for (const u of candidates) {
    try {
      const res = await fetch(u, {
        method: 'HEAD',
        signal: AbortSignal.timeout(2800),
        redirect: 'follow',
      })
      if (!res.ok) continue
      const ct = (res.headers.get('content-type') || '').toLowerCase()
      if (ct.includes('text/html')) continue
      const looksImage =
        ct.startsWith('image/') ||
        ct.includes('octet-stream') ||
        u.endsWith('.ico') ||
        /\.(png|jpg|jpeg|webp|gif|svg)(\?|$)/i.test(u) ||
        /favicon|\/apple-touch-icon/i.test(u)
      if (looksImage || (!ct && /favicon\.ico(\?|$)/i.test(u))) {
        return u
      }
    } catch {
      continue
    }
  }

  try {
    const u = new URL(pageUrl)
    return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`
  } catch {
    return candidates[0] ?? ''
  }
}
