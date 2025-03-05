'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Home,
  FolderOpenDot,
  Globe,
  Plus,
  Loader2,
  RocketIcon,
  LogOut,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { getCategories } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CategoryForm } from '@/components/category-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

import Logo from '@/images/logo2.png'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)

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

  const handleCategoryAdded = async () => {
    setOpenDialog(false)
    setIsLoading(true)
    const updatedCategories = await getCategories()
    setCategories(updatedCategories)
    setIsLoading(false)
  }

  // Static navigation items
  const navItems = [
    {
      title: '所有网站',
      url: '/',
      icon: Home,
    },
    {
      title: '网站展示',
      url: '/showcase',
      icon: Globe,
    },
  ]

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="py-4">
        <div className="flex justify-center items-center gap-5 px-4">
          <Image
            src={Logo}
            alt="Logo"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight">星途 AI 导航</h2>
            <p className="text-xs text-muted-foreground">AI 应用一站式导航</p>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="pb-0">
        <SidebarGroup>
          <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    active={pathname === item.url ? 'true' : undefined}
                  >
                    <Link href={item.url} className="flex items-center">
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between mb-2 px-2">
            <SidebarGroupLabel className="mb-0">网站分类</SidebarGroupLabel>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setOpenDialog(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">添加分类</span>
            </Button>
          </div>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="flex justify-center py-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground px-3 py-2">
                暂无分类
              </p>
            ) : (
              <SidebarMenu>
                {categories.map((category) => (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton
                      asChild
                      active={
                        pathname === `/category/${category.slug}`
                          ? 'true'
                          : undefined
                      }
                    >
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex items-center"
                      >
                        <FolderOpenDot className="h-4 w-4 mr-2" />
                        <span>{category.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile and theme toggle at the bottom */}
      <div className="mt-auto">
        <Separator />
        <SidebarFooter className="py-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/avatar-placeholder.png" alt="用户头像" />
                <AvatarFallback>用户</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">管理员</p>
                <p className="text-xs text-muted-foreground">
                  admin@example.com
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button variant="ghost" size="icon" title="退出登录">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </div>

      {/* Category Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>网站分类管理</DialogTitle>
          </DialogHeader>
          <CategoryForm onSuccess={handleCategoryAdded} />
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}
