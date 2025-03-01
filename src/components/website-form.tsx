'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createWebsite, updateWebsite } from '@/lib/actions'

const websiteSchema = z.object({
  name: z.string().min(1, '网站名称不能为空'),
  url: z.string().url('请输入有效的URL'),
  iconUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  description: z.string().optional(),
  tags: z.array(z.string()),
})

export function WebsiteForm({ website = null, onSuccess }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const defaultValues = website
    ? { ...website }
    : {
        name: '',
        url: '',
        iconUrl: '',
        description: '',
        tags: [],
      }

  const form = useForm({
    resolver: zodResolver(websiteSchema),
    defaultValues,
  })

  const tags = form.watch('tags')

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      form.setValue('tags', [...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    form.setValue(
      'tags',
      tags.filter((t) => t !== tag)
    )
  }

  const onSubmit = async (data) => {
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
