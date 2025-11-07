'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { createCategory, deleteCategory, getCategories } from '@/lib/actions'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type WebCategory } from '@/types/nav-list'

const categorySchema = z.object({
  name: z.string().min(1, '分类名称不能为空'),
  slug: z
    .string()
    .min(1, '分类别名不能为空')
    .regex(/^[a-z0-9-]+$/, '只能包含小写字母、数字和连字符'),
  icon: z.string().optional(),
})

export function CategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categories, setCategories] = useState<WebCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      icon: '',
    },
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data.map((c) => ({ ...c, icon: c.icon ?? undefined })))
      } catch (error) {
        console.error('加载分类失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const onSubmit = async (data: any) => {
    console.log('Submitting category:', data)
    try {
      setIsSubmitting(true)
      setError(null)
      await createCategory(data)
      form.reset()
      const updatedCategories = await getCategories()
      setCategories(
        updatedCategories.map((c) => ({ ...c, icon: c.icon ?? undefined }))
      )
      router.refresh()
    } catch (error: any) {
      console.error('创建分类时出错:', error)
      // Improved error handling to catch unique constraint errors
      if (
        error.code === 'P2002' ||
        error.message?.includes('Unique constraint failed')
      ) {
        // Check if the error specifically mentions 'name' field
        if (
          error.meta?.target?.includes('name') ||
          error.message?.includes('name')
        ) {
          setError('分类名称已存在，请使用不同的名称')
        } else if (
          error.meta?.target?.includes('slug') ||
          error.message?.includes('slug')
        ) {
          setError('分类别名已存在，请使用不同的别名')
        } else {
          setError('分类名称或别名已存在，请使用不同的名称')
        }
      } else {
        setError('创建分类失败，请稍后重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？相关的网站分类关联也会被删除。')) return

    try {
      setIsDeleting(true)
      await deleteCategory(id)
      const updatedCategories = await getCategories()
      setCategories(
        updatedCategories.map((c) => ({ ...c, icon: c.icon ?? undefined }))
      )
      router.refresh()
    } catch (error) {
      console.error('删除分类时出错:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类名称</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="输入分类名称" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类别名</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="category-slug"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                      }}
                    />
                  </FormControl>
                </div>
                <p className="text-xs text-muted-foreground">
                  用于URL的分类标识，只能包含小写字母、数字和连字符
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类图标</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      placeholder="Lucide图标名称 (如: Code, Brain, Book等)"
                      {...field}
                    />
                  </FormControl>
                </div>
                <p className="text-xs text-muted-foreground">
                  从 https://lucide.dev/icons/ 选择图标名称，可选字段
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                创建中...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                创建分类
              </>
            )}
          </Button>
        </form>
      </Form>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">现有分类</h3>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无分类</p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <span>{category.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onSuccess}>
          完成
        </Button>
      </div>
    </div>
  )
}
