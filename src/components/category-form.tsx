'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
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
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategorySort,
} from '@/lib/actions'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type WebCategory } from '@/types/nav-list'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// 单个可拖拽排序的分类项
function SortableCategoryItem({
  category,
  isEditing,
  editingCategory,
  editForm,
  onEditSubmit,
  cancelEditing,
  startEditing,
  handleDelete,
  isSubmitting,
  isDeleting,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  category: WebCategory
  isEditing: boolean
  editingCategory: WebCategory | null
  editForm: any
  onEditSubmit: (data: any) => void
  cancelEditing: () => void
  startEditing: (category: WebCategory) => void
  handleDelete: (id: string) => void
  isSubmitting: boolean
  isDeleting: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : ('auto' as any),
  }

  return (
    <div ref={setNodeRef} style={style}>
      {isEditing && editingCategory?.id === category.id ? (
        <Form {...editForm}>
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-3 p-3 border border-blue-200 rounded-lg bg-blue-50/40"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">分类名称</FormLabel>
                    <FormControl>
                      <Input
                        size={1}
                        className="h-8 text-sm"
                        placeholder="分类名称"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">分类别名</FormLabel>
                    <FormControl>
                      <Input
                        size={1}
                        className="h-8 text-sm"
                        placeholder="category-slug"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={editForm.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">分类图标</FormLabel>
                  <FormControl>
                    <Input
                      size={1}
                      className="h-8 text-sm"
                      placeholder="Lucide图标名称"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={cancelEditing}
              >
                取消
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                保存
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="flex items-center justify-between rounded-lg border p-2.5 bg-white hover:bg-gray-50/50 transition-colors group">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 拖拽手柄 */}
            <button
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded touch-none opacity-50 group-hover:opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
              aria-label="拖拽排序"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            {/* 排序序号 */}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground shrink-0">
              {category.sortOrder + 1}
            </span>
            <span className="text-sm font-medium truncate">
              {category.name}
            </span>
          </div>
          <div className="flex gap-0.5 shrink-0">
            {/* 上移按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
              onClick={onMoveUp}
              disabled={isFirst}
              title="上移"
            >
              <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {/* 下移按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
              onClick={onMoveDown}
              disabled={isLast}
              title="下移"
            >
              <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {/* 分隔线 */}
            <div className="w-px h-5 bg-border mx-0.5 self-center" />
            {/* 编辑按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100"
              onClick={() => startEditing(category)}
              title="编辑"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            {/* 删除按钮 */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-50"
              onClick={() => handleDelete(category.id)}
              disabled={isDeleting}
              title="删除"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState<WebCategory | null>(
    null
  )
  const [categories, setCategories] = useState<WebCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSorting, setIsSorting] = useState(false)

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      icon: '',
    },
  })

  const editForm = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      icon: '',
    },
  })

  // 检查两个 @dnd-kit 依赖是否存在
  useEffect(() => {
    const checkDND = async () => {
      try {
        await import('@dnd-kit/core')
        await import('@dnd-kit/sortable')
      } catch {
        console.warn('拖拽排序依赖未安装，自动降级为按钮排序模式')
      }
    }
    checkDND()
  }, [])

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 拖拽 8px 后才激活，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 刷新分类列表
  const refreshCategories = async () => {
    const data = await getCategories()
    setCategories(data.map((c) => ({ ...c, icon: c.icon ?? null })))
  }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        await refreshCategories()
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
      await refreshCategories()
      router.refresh()
    } catch (error: any) {
      console.error('创建分类时出错:', error)
      if (
        error.code === 'P2002' ||
        error.message?.includes('Unique constraint failed')
      ) {
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
      await refreshCategories()
      router.refresh()
    } catch (error) {
      console.error('删除分类时出错:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const startEditing = (category: WebCategory) => {
    setEditingCategory(category)
    setIsEditing(true)
    editForm.reset({
      name: category.name,
      slug: category.slug,
      icon: category.icon ?? '',
    })
    setError(null)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditingCategory(null)
    editForm.reset({
      name: '',
      slug: '',
      icon: '',
    })
    setError(null)
  }

  const onEditSubmit = async (data: any) => {
    if (!editingCategory) return

    try {
      setIsSubmitting(true)
      setError(null)
      const result = await updateCategory(editingCategory.id, {
        name: data.name,
        slug: data.slug,
        icon: data.icon || null,
      })

      if ('success' in result && !result.success) {
        setError(result.message)
        return
      }

      cancelEditing()
      await refreshCategories()
      router.refresh()
    } catch (error: any) {
      console.error('更新分类时出错:', error)
      if (
        error.code === 'P2002' ||
        error.message?.includes('Unique constraint failed')
      ) {
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
        setError('更新分类失败，请稍后重试')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 拖拽结束后的处理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // 找到旧位置和新位置
    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // 本地重新排序
    const newCategories = arrayMove(categories, oldIndex, newIndex)
    setCategories(newCategories)

    // 保存排序到服务器
    await saveSortOrder(newCategories)
  }

  // 上移
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return
    const newCategories = arrayMove(categories, index, index - 1)
    setCategories(newCategories)
    await saveSortOrder(newCategories)
  }

  // 下移
  const handleMoveDown = async (index: number) => {
    if (index >= categories.length - 1) return
    const newCategories = arrayMove(categories, index, index + 1)
    setCategories(newCategories)
    await saveSortOrder(newCategories)
  }

  // 保存排序到服务器
  const saveSortOrder = async (sortedCategories: WebCategory[]) => {
    setIsSorting(true)
    try {
      const result = await updateCategorySort(sortedCategories.map((c) => c.id))
      if (!result.success) {
        // 如果保存失败，重新加载原始数据
        await refreshCategories()
      }
      router.refresh()
    } catch (error) {
      console.error('保存排序失败:', error)
      await refreshCategories()
    } finally {
      setIsSorting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 提示信息 - 拖拽排序 */}
      <div className="p-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
        <GripVertical className="h-4 w-4 shrink-0" />
        <span className="flex-1">
          拖拽左侧 <GripVertical className="h-3 w-3 inline" /> 手柄或点击{' '}
          <ArrowUp className="h-3 w-3 inline" />{' '}
          <ArrowDown className="h-3 w-3 inline" /> 按钮调整分类排序
        </span>
        {isSorting && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* 左右两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* 左侧：创建新分类表单 */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-4 space-y-4 h-full">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              添加新分类
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        分类名称
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="例如：AI 写作" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        分类别名
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ai-writing"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                          }}
                        />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground">
                        用于 URL，只能包含小写字母、数字和连字符
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
                      <FormLabel className="text-xs text-muted-foreground">
                        分类图标
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Lucide 图标名称" {...field} />
                      </FormControl>
                      <p className="text-[11px] text-muted-foreground">
                        从 lucide.dev/icons 选择，可选
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
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
          </div>
        </div>

        {/* 右侧：现有分类列表 */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-card p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <GripVertical className="h-4 w-4" />
                现有分类
                {categories.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    ({categories.length})
                  </span>
                )}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">
                  暂无分类，请在左侧添加
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] -mx-1 px-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1.5 pr-2">
                      {categories.map((category, index) => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          isEditing={isEditing}
                          editingCategory={editingCategory}
                          editForm={editForm}
                          onEditSubmit={onEditSubmit}
                          cancelEditing={cancelEditing}
                          startEditing={startEditing}
                          handleDelete={handleDelete}
                          isSubmitting={isSubmitting}
                          isDeleting={isDeleting}
                          onMoveUp={() => handleMoveUp(index)}
                          onMoveDown={() => handleMoveDown(index)}
                          isFirst={index === 0}
                          isLast={index === categories.length - 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex justify-end border-t pt-4">
        <Button type="button" onClick={onSuccess} className="px-6">
          完成
        </Button>
      </div>
    </div>
  )
}
