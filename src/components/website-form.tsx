'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createWebsite, updateWebsite, getCategories } from '@/lib/actions'
import { WebsiteProps, WebCategory } from '@/types/nav-list'

const websiteSchema = z.object({
  name: z.string().min(1, '网站名称不能为空'),
  url: z.string().url('请输入有效的URL'),
  iconUrl: z.string().url('请输入有效的URL'),
  description: z.string(),
  tags: z.array(z.string()),
  categoryIds: z.array(z.string()),
})

export function WebsiteForm({
  website,
  onSuccess,
}: {
  website?: WebsiteProps
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [categories, setCategories] = useState<WebCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('加载分类失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  // 获取网站已有的分类ID
  const getWebsiteCategoryIds = () => {
    if (!website || !website.categories) return []

    // 编辑时的数据结构：categories直接是分类对象数组，所以直接使用wc.id
    return website.categories.map((wc: any) => wc.id).filter(Boolean)
  }

  const defaultValues = website
    ? { ...website, categoryIds: getWebsiteCategoryIds() }
    : {
        name: '',
        url: '',
        iconUrl: '',
        description: '',
        tags: [],
        categoryIds: [],
      }

  const form = useForm({
    resolver: zodResolver(websiteSchema) as any,
    defaultValues,
  })

  const tags = form.watch('tags')
  const categoryIds = form.watch('categoryIds')

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      form.setValue('tags', [...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: any) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    )
  }

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      if (website) {
        await updateWebsite(website.id, data)
      } else {
        await createWebsite(data)
      }
      router.refresh()
      onSuccess?.()
    } catch (error) {
      console.error('提交表单时出错:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站名称</FormLabel>
              <FormControl>
                <Input placeholder="输入网站名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站链接</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iconUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>图标链接 (可选)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/favicon.ico"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>网站描述 (可选)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="简要描述这个网站..."
                  className="resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryIds"
          render={() => (
            <FormItem>
              <FormLabel>网站分类</FormLabel>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    加载分类...
                  </span>
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无分类可选</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <FormItem
                      key={category.id}
                      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                    >
                      <FormControl>
                        <Checkbox
                          checked={categoryIds.includes(category.id)}
                          onCheckedChange={(checked) => {
                            const newCategoryIds = checked
                              ? [...categoryIds, category.id]
                              : categoryIds.filter((id) => id !== category.id)
                            form.setValue('categoryIds', newCategoryIds)
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        {category.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={() => (
            <FormItem>
              <FormLabel>标签</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">移除 {tag}</span>
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="添加标签"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {website ? '更新' : '创建'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
