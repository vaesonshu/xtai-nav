'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  detectBannerColorTab,
  normalizeSolidHex,
  parseLinearGradient,
  parseRadialGradient,
  type BannerColorTabKind,
} from '@/lib/banner-styles'

type Props = {
  id?: string
  label: string
  /** 表单字段当前值：hex / rgb / linear-gradient(...) / radial-gradient(...) */
  value: string
  onChange: (next: string) => void
  /** 切换到「纯色」Tab 时的默认 hex */
  defaultSolid?: string
}

/** 供 type=color 使用：非 hex 时用占位，避免控件报错 */
function coerceHexForPicker(cssColor: string, fallback: string): string {
  const t = cssColor.trim()
  if (/^#[0-9A-Fa-f]{6}$/i.test(t)) return t.toLowerCase()
  return fallback
}

export function BannerAppearanceColorField({
  id,
  label,
  value,
  onChange,
  defaultSolid = '#0ea5e9',
}: Props) {
  const tab = detectBannerColorTab(value || '')
  const solidHex = normalizeSolidHex(value || '', defaultSolid)
  const linear = parseLinearGradient(value || '')
  const radial = parseRadialGradient(value || '')

  const angle = linear?.angle ?? 90
  const lc1 = linear?.c1 ?? defaultSolid
  const lc2 = linear?.c2 ?? '#6366f1'
  const rc1 = radial?.c1 ?? '#ffffff'
  const rc2 = radial?.c2 ?? defaultSolid

  const handleTabChange = (next: string) => {
    const kind = next as BannerColorTabKind
    if (kind === 'solid') {
      const hex =
        tab === 'linear'
          ? coerceHexForPicker(lc1, defaultSolid)
          : tab === 'radial'
            ? coerceHexForPicker(rc1, defaultSolid)
            : solidHex
      onChange(normalizeSolidHex(hex, defaultSolid))
      return
    }
    if (kind === 'linear') {
      const c1 =
        tab === 'solid'
          ? solidHex
          : tab === 'radial'
            ? coerceHexForPicker(rc1, defaultSolid)
            : lc1
      const c2 =
        tab === 'solid'
          ? '#6366f1'
          : tab === 'radial'
            ? coerceHexForPicker(rc2, '#6366f1')
            : lc2
      onChange(
        `linear-gradient(${angle}deg, ${normalizeSolidHex(coerceHexForPicker(c1, defaultSolid), defaultSolid)}, ${normalizeSolidHex(coerceHexForPicker(c2, '#6366f1'), '#6366f1')})`
      )
      return
    }
    const r1 =
      tab === 'solid'
        ? solidHex
        : tab === 'linear'
          ? coerceHexForPicker(lc1, '#ffffff')
          : rc1
    const r2 =
      tab === 'solid'
        ? defaultSolid
        : tab === 'linear'
          ? coerceHexForPicker(lc2, defaultSolid)
          : rc2
    onChange(`radial-gradient(circle at center, ${r1}, ${r2})`)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1">
          <TabsTrigger value="solid" className="text-xs sm:text-sm">
            纯色
          </TabsTrigger>
          <TabsTrigger value="linear" className="text-xs sm:text-sm">
            线性渐变
          </TabsTrigger>
          <TabsTrigger value="radial" className="text-xs sm:text-sm">
            径向渐变
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solid" className="space-y-2 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            {/* 原生颜色选择器：仅支持 hex */}
            <input
              id={id}
              type="color"
              aria-label={`${label} 纯色`}
              className="h-10 w-14 shrink-0 cursor-pointer rounded border border-input bg-background p-1"
              value={coerceHexForPicker(value || '', defaultSolid)}
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="text-xs text-muted-foreground">
              可与下方 CSS 输入框配合修改（如 rgb、hsl）
            </span>
          </div>
        </TabsContent>

        <TabsContent value="linear" className="space-y-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="w-16 shrink-0 text-xs text-muted-foreground">
              角度
            </Label>
            <Input
              type="number"
              min={0}
              max={360}
              className="h-9 w-24 font-mono text-sm"
              value={angle}
              onChange={(e) => {
                const a = Math.min(
                  360,
                  Math.max(0, Number(e.target.value) || 0)
                )
                onChange(`linear-gradient(${a}deg, ${lc1}, ${lc2})`)
              }}
            />
            <span className="text-xs text-muted-foreground">
              deg（0→右，90→下）
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">起点</span>
              <input
                type="color"
                aria-label="渐变起点色"
                className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                value={coerceHexForPicker(lc1, defaultSolid)}
                onChange={(e) =>
                  onChange(
                    `linear-gradient(${angle}deg, ${e.target.value}, ${lc2})`
                  )
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">终点</span>
              <input
                type="color"
                aria-label="渐变终点色"
                className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                value={coerceHexForPicker(lc2, '#6366f1')}
                onChange={(e) =>
                  onChange(
                    `linear-gradient(${angle}deg, ${lc1}, ${e.target.value})`
                  )
                }
              />
            </div>
          </div>
          {/* 渐变缩略条 */}
          <div
            className="h-3 w-full rounded border border-black/10"
            style={{ background: value }}
          />
        </TabsContent>

        <TabsContent value="radial" className="space-y-3 pt-1">
          <p className="text-xs text-muted-foreground">
            自中心向外扩散（circle at center）
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">中心</span>
              <input
                type="color"
                aria-label="径向渐变中心色"
                className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                value={coerceHexForPicker(rc1, '#ffffff')}
                onChange={(e) =>
                  onChange(
                    `radial-gradient(circle at center, ${e.target.value}, ${rc2})`
                  )
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">边缘</span>
              <input
                type="color"
                aria-label="径向渐变边缘色"
                className="h-10 w-14 cursor-pointer rounded border border-input bg-background p-1"
                value={coerceHexForPicker(rc2, defaultSolid)}
                onChange={(e) =>
                  onChange(
                    `radial-gradient(circle at center, ${rc1}, ${e.target.value})`
                  )
                }
              />
            </div>
          </div>
          <div
            className="h-16 w-full rounded border border-black/10"
            style={{ background: value }}
          />
        </TabsContent>
      </Tabs>

      {/* 高级：直接编辑 CSS，可与颜色选择器混用 */}
      <div>
        <Label className="mb-1 text-xs text-muted-foreground">
          CSS 值（可粘贴自定义渐变）
        </Label>
        <Input
          className="font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#rgb / linear-gradient(...) / radial-gradient(...)"
        />
      </div>
    </div>
  )
}
