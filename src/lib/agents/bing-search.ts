/**
 * Azure Bing Web Search v7（需在 Azure 门户创建「Bing Search」资源并获取密钥）。
 * 文档：https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/overview
 */

export interface BingWebPageHit {
  title: string
  url: string
  snippet: string
}

type BingJson = {
  webPages?: {
    value?: Array<{ name?: string; url?: string; snippet?: string }>
  }
}

export async function searchBingWeb(
  query: string,
  count: number
): Promise<
  | { ok: true; results: BingWebPageHit[] }
  | { ok: false; error: string; hint?: string }
> {
  const apiKey = process.env.BING_SEARCH_API_KEY?.trim()
  if (!apiKey) {
    return {
      ok: false,
      error: '未配置 BING_SEARCH_API_KEY',
      hint: '在 Azure 创建 Bing Search v7 资源，将密钥写入环境变量；可选 BING_SEARCH_ENDPOINT、BING_SEARCH_MKT。',
    }
  }

  const trimmed = query.trim()
  if (!trimmed) {
    return { ok: false, error: '查询词为空' }
  }

  const n = Math.min(Math.max(count, 1), 10)
  const endpoint =
    process.env.BING_SEARCH_ENDPOINT?.trim() ||
    'https://api.bing.microsoft.com/v7.0/search'
  const mkt = process.env.BING_SEARCH_MKT?.trim() || 'zh-CN'

  const url = new URL(endpoint)
  url.searchParams.set('q', trimmed)
  url.searchParams.set('count', String(n))
  if (!url.searchParams.has('mkt')) url.searchParams.set('mkt', mkt)

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Ocp-Apim-Subscription-Key': apiKey },
      signal: AbortSignal.timeout(25_000),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, error: `必应请求失败: ${msg}` }
  }

  let data: BingJson
  try {
    data = (await res.json()) as BingJson
  } catch {
    return { ok: false, error: '必应响应不是合法 JSON' }
  }

  if (!res.ok) {
    return {
      ok: false,
      error: `必应 API HTTP ${res.status}`,
      hint: JSON.stringify(data).slice(0, 500),
    }
  }

  const values = data.webPages?.value ?? []
  const results: BingWebPageHit[] = values.map((v) => ({
    title: v.name ?? '',
    url: v.url ?? '',
    snippet: v.snippet ?? '',
  }))

  return { ok: true, results }
}
