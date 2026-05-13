'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  bannerAuxiliaryColor,
  bannerBarBackgroundStyle,
  bannerMainContentStyle,
} from '@/lib/banner-styles'

type BannerConfig = {
  enabled?: boolean
  content?: string
  link?: string
  background?: string
  textColor?: string
  /** 是否显示右侧关闭按钮 */
  showCloseButton?: boolean
  /** 按钮展示文案，空则默认「×」 */
  closeButtonText?: string | null
  /** aria-label，空则默认「关闭通告」 */
  closeButtonLabel?: string | null
}

/** 广告栏展示状态 */
type BannerPhase =
  | 'initial'
  | 'loading'
  | 'open'
  | 'closing'
  | 'closed'
  | 'disabled'

/** 同步通告实际高度到 html：桌面侧栏下移 + 文档流占位（见 spacer） */
function setTopBannerOffset(px: number) {
  document.documentElement.style.setProperty(
    '--top-banner-offset',
    `${Math.max(0, Math.round(px))}px`
  )
}

export default function TopBanner() {
  const [config, setConfig] = useState<BannerConfig | null>(null)
  const [phase, setPhase] = useState<BannerPhase>('initial')
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (sessionStorage.getItem('topBannerClosed') === '1') {
        setPhase('closed')
        return
      }
    } catch {
      /* ignore */
    }

    setPhase('loading')
    ;(async () => {
      try {
        const res = await fetch('/api/banner')
        const data = await res.json()
        setConfig(data)
        if (data?.enabled) setPhase('open')
        else setPhase('disabled')
      } catch (err) {
        console.error('加载广告栏失败', err)
        setPhase('disabled')
      }
    })()
  }, [])

  // 测量 fixed 通告高度 → 更新全局变量（侧栏 top + 下方占位同步）
  useLayoutEffect(() => {
    if (phase !== 'open' && phase !== 'closing') {
      setTopBannerOffset(0)
      return
    }

    const el = bannerRef.current
    if (!el) {
      setTopBannerOffset(0)
      return
    }

    const apply = () => setTopBannerOffset(el.getBoundingClientRect().height)
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => {
      ro.disconnect()
      setTopBannerOffset(0)
    }
  }, [phase])

  const handleClose = () => {
    try {
      sessionStorage.setItem('topBannerClosed', '1')
    } catch {
      /* ignore */
    }
    setPhase((p) => (p === 'open' ? 'closing' : p))
  }

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== 'max-height') return
    setPhase((p) => (p === 'closing' ? 'closed' : p))
  }

  if (
    phase === 'closed' ||
    phase === 'disabled' ||
    phase === 'initial' ||
    phase === 'loading'
  ) {
    return null
  }

  const showClose = config?.showCloseButton !== false
  const closeText =
    config?.closeButtonText != null &&
    String(config.closeButtonText).trim() !== ''
      ? String(config.closeButtonText).trim()
      : '×'
  const closeAria =
    config?.closeButtonLabel != null &&
    String(config.closeButtonLabel).trim() !== ''
      ? String(config.closeButtonLabel).trim()
      : '关闭通告'

  return (
    <>
      {/* 占位：fixed 不占文档流，用与侧栏相同的 CSS 变量顶开下方布局，滚动时内容不会钻进通告底下 */}
      <div
        aria-hidden
        className="pointer-events-none shrink-0 w-full"
        style={{ height: 'var(--top-banner-offset, 0px)' }}
      />
      <div
        ref={bannerRef}
        id="top-banner"
        role="region"
        aria-label="站点通告"
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          'fixed inset-x-0 top-0 z-40 overflow-hidden border-b border-black/10 shadow-md transition-[max-height] duration-300 ease-in-out',
          phase === 'closing'
            ? 'max-h-0 border-transparent shadow-none'
            : 'max-h-[min(40vh,240px)]'
        )}
        style={bannerBarBackgroundStyle(config?.background, '#0ea5e9')}
      >
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <div
            className="min-w-0 flex-1 text-sm leading-6 [&_a]:underline"
            style={bannerMainContentStyle(config?.textColor, '#ffffff')}
            dangerouslySetInnerHTML={{ __html: config?.content || '' }}
          />
          <div
            className="flex shrink-0 items-center gap-3"
            style={{
              color: bannerAuxiliaryColor(config?.textColor, '#ffffff'),
            }}
          >
            {config?.link ? (
              <a
                href={config.link}
                className="text-sm underline"
                target="_blank"
                rel="noreferrer"
              >
                查看
              </a>
            ) : null}
            {showClose ? (
              <button
                type="button"
                aria-label={closeAria}
                title={closeAria}
                className={cn(
                  'rounded px-2 py-1 text-xl font-bold leading-none hover:bg-black/10',
                  closeText !== '×' && 'text-sm font-semibold'
                )}
                onClick={handleClose}
              >
                {closeText}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}
