'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  bannerAuxiliaryColor,
  bannerBarBackgroundStyle,
  bannerMainContentStyle,
} from '@/lib/banner-styles'
import { getBannerConfig, upsertBannerConfig } from '@/lib/actions'
import { BannerAppearanceColorField } from '@/components/admin/banner-appearance-color-field'

/** 管理后台：对照前台通告栏布局做即时 HTML 预览（按钮仅占位，避免提交表单） */
function BannerContentPreview({
  contentHtml,
  background,
  textColor,
  link,
  showCloseButton,
  closeButtonText,
  closeButtonLabel,
}: {
  contentHtml: string
  background: string
  textColor: string
  link: string
  showCloseButton: boolean
  closeButtonText: string
  closeButtonLabel: string
}) {
  const closeTxt = closeButtonText.trim() !== '' ? closeButtonText.trim() : '×'
  const closeAria =
    closeButtonLabel.trim() !== '' ? closeButtonLabel.trim() : '关闭通告'

  return (
    <div
      className="max-h-[min(40vh,280px)] overflow-auto rounded-md border border-black/10 shadow-md"
      style={bannerBarBackgroundStyle(background, '#0ea5e9')}
    >
      <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
        <div
          className="min-w-0 flex-1 text-sm leading-6 [&_a]:underline"
          style={bannerMainContentStyle(textColor, '#ffffff')}
        >
          {contentHtml.trim() ? (
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          ) : (
            <span className="opacity-75">
              （暂无 HTML 内容，请在下方编辑器中输入）
            </span>
          )}
        </div>
        <div
          className="flex shrink-0 items-center gap-3"
          style={{ color: bannerAuxiliaryColor(textColor, '#ffffff') }}
        >
          {link.trim() ? (
            <span className="pointer-events-none text-sm underline opacity-95">
              查看
            </span>
          ) : null}
          {showCloseButton ? (
            <button
              type="button"
              disabled
              aria-hidden
              title={`预览占位（${closeAria}）`}
              className={cn(
                'cursor-default rounded px-2 py-1 text-xl font-bold leading-none opacity-90',
                closeTxt !== '×' && 'text-sm font-semibold'
              )}
            >
              {closeTxt}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function BannerManage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initial, setInitial] = useState<any>(null)

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      enabled: false,
      content: '',
      link: '',
      background: '#0ea5e9',
      textColor: '#ffffff',
      showCloseButton: true,
      closeButtonText: '',
      closeButtonLabel: '',
    },
  })

  // 与表单联动：任一字段变更后预览即时更新
  const [
    watchedContent,
    watchedBg,
    watchedFg,
    watchedLink,
    watchedShowClose,
    watchedCloseText,
    watchedCloseLabel,
  ] = useWatch({
    control,
    name: [
      'content',
      'background',
      'textColor',
      'link',
      'showCloseButton',
      'closeButtonText',
      'closeButtonLabel',
    ],
  })

  useEffect(() => {
    ;(async () => {
      try {
        const cfg = await getBannerConfig()
        if (cfg) {
          setInitial(cfg)
          reset({
            ...cfg,
            // 兼容旧数据：未写入时默认展示关闭按钮
            showCloseButton: cfg.showCloseButton !== false,
            closeButtonText: cfg.closeButtonText ?? '',
            closeButtonLabel: cfg.closeButtonLabel ?? '',
          })
        }
      } catch (err) {
        console.error('加载广告栏配置失败', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [reset])

  const onSubmit = async (data: any) => {
    try {
      setSaving(true)
      await upsertBannerConfig({
        enabled: !!data.enabled,
        content: data.content,
        link: data.link,
        background: data.background,
        textColor: data.textColor,
        showCloseButton: !!data.showCloseButton,
        closeButtonText: data.closeButtonText,
        closeButtonLabel: data.closeButtonLabel,
      })
      router.refresh()
      alert('保存成功')
    } catch (err) {
      console.error('保存失败', err)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 与「网站管理」「日志管理」一致的页头层级与字号 */}
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            顶部广告栏配置
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            配置全站顶部通告的文案与样式，包含 HTML
            内容、外链、背景与文字颜色及关闭按钮行为；保存后对前台生效。
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">加载配置中…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="enabled" {...register('enabled')} />
              <Label htmlFor="enabled" className="cursor-pointer font-normal">
                启用广告栏
              </Label>
            </div>

            {/* 预览与 HTML：区块标题与说明同后台列表页的层级习惯 */}
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                    实时预览
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    样式与前台通告栏一致；链接与关闭按钮在此仅供观感参考，不会在预览区内跳转。
                  </p>
                </div>
                <BannerContentPreview
                  contentHtml={
                    typeof watchedContent === 'string' ? watchedContent : ''
                  }
                  background={
                    typeof watchedBg === 'string' ? watchedBg : '#0ea5e9'
                  }
                  textColor={
                    typeof watchedFg === 'string' ? watchedFg : '#ffffff'
                  }
                  link={typeof watchedLink === 'string' ? watchedLink : ''}
                  showCloseButton={watchedShowClose !== false}
                  closeButtonText={
                    typeof watchedCloseText === 'string' ? watchedCloseText : ''
                  }
                  closeButtonLabel={
                    typeof watchedCloseLabel === 'string'
                      ? watchedCloseLabel
                      : ''
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="banner-content" className="text-gray-900">
                  广告内容（支持 HTML）
                </Label>
                <Textarea
                  id="banner-content"
                  {...register('content')}
                  className="min-h-[200px] w-full font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  支持简单 HTML（例如链接、加粗）；内容来自管理员输入，请注意
                  XSS 风险。
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-link" className="text-gray-900">
                链接（可选）
              </Label>
              <Input id="banner-link" {...register('link')} />
            </div>

            <div className="grid gap-8 sm:grid-cols-1">
              <Controller
                name="background"
                control={control}
                render={({ field }) => (
                  <BannerAppearanceColorField
                    id="banner-background"
                    label="背景"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    defaultSolid="#0ea5e9"
                  />
                )}
              />
              <Controller
                name="textColor"
                control={control}
                render={({ field }) => (
                  <BannerAppearanceColorField
                    id="banner-text-color"
                    label="文字颜色（正文 HTML 区域；渐变字时右侧按钮为浅色兜底）"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    defaultSolid="#ffffff"
                  />
                )}
              />
            </div>

            {/* 关闭按钮：分区标题与网站管理内卡片标题气质接近 */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  关闭按钮
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  控制访客是否可关闭通告，以及按钮文案与无障碍读屏名称。
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  name="showCloseButton"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="showCloseButton"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="showCloseButton"
                  className="cursor-pointer font-normal"
                >
                  显示关闭按钮
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeButtonText" className="text-gray-900">
                  按钮文案（可选）
                </Label>
                <Input
                  id="closeButtonText"
                  {...register('closeButtonText')}
                  placeholder="默认 ×；可改为「关闭」「知道了」等"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeButtonLabel" className="text-gray-900">
                  无障碍名称（可选，aria-label / title）
                </Label>
                <Input
                  id="closeButtonLabel"
                  {...register('closeButtonLabel')}
                  placeholder="默认「关闭通告」"
                />
                <p className="text-sm text-muted-foreground">
                  供读屏软件识别；不填则使用默认文案。
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-6">
              <Button type="submit" disabled={saving}>
                {saving ? '保存中...' : '保存配置'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (initial) {
                    reset({
                      ...initial,
                      showCloseButton: initial.showCloseButton !== false,
                      closeButtonText: initial.closeButtonText ?? '',
                      closeButtonLabel: initial.closeButtonLabel ?? '',
                    })
                  }
                }}
              >
                重置为当前值
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
