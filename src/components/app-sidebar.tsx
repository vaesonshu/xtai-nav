'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import {
  Home,
  FolderOpenDot,
  Loader2,
  NotepadText,
  Star,
  Settings,
  FileText,
  Eye,
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
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { WebCategory } from '@/types/nav-list'
import Logo from '@/images/logo2.png'
import { useToast } from '@/hooks/use-toast'
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { isAdmin } from '@/lib/utils'

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [categories, setCategories] = useState<WebCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const { errorToast } = useToast()

  const loadCategories = useCallback(async () => {
    try {
      // const data = await getCategories()
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('加载分类失败:', error)
      errorToast('分类加载失败', {
        description: error as string,
      })
    } finally {
      setIsLoading(false)
    }
  }, [errorToast])

  useEffect(() => {
    loadCategories()
  }, []) // 空依赖数组，只在组件挂载时运行一次

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        try {
          const adminStatus = await isAdmin(user.id)
          setIsAdminUser(adminStatus)
        } catch (error) {
          console.error('检查管理员状态失败:', error)
          setIsAdminUser(false)
        }
      } else {
        setIsAdminUser(false)
      }
    }

    checkAdminStatus()
  }, [user?.id])

  // Static navigation items - conditionally include admin item
  const navItems = [
    {
      title: '应用广场',
      url: '/',
      icon: Home,
    },
    {
      title: '我的收藏',
      url: '/favorites',
      icon: Star,
    },
    ...(isAdminUser
      ? [
          {
            title: '网站管理',
            url: '/admin',
            icon: Settings,
          },
        ]
      : []),
  ]

  const footItems = [
    {
      title: '留言板',
      url: '/message-board',
      icon: NotepadText,
    },
    {
      title: '系统日志',
      url: '/logs',
      icon: Eye,
    },
    ...(isAdminUser
      ? [
          {
            title: '日志管理',
            url: '/admin/logs',
            icon: FileText,
          },
        ]
      : []),
  ]

  return (
    <Sidebar className="border-r bg-background">
      <SidebarHeader className="flex flex-row justify-between items-center h-14">
        <div className="flex justify-start items-center gap-2 px-2">
          <Image
            src={Logo}
            alt="Logo"
            width={35}
            height={35}
            className="rounded-md"
          />
          <div className="flex flex-col">
            <h2 className="text-sm font-bold tracking-tight">星途 AI 导航</h2>
            <p className="text-xs text-muted-foreground">AI 应用一站式导航</p>
          </div>
        </div>
        <SidebarTrigger className="w-8 h-8" />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="pb-0">
        <SidebarGroup>
          <SidebarGroupLabel>导航菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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
          <SidebarGroupLabel>网站分类</SidebarGroupLabel>
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
                      isActive={pathname === `/category/${category.slug}`}
                    >
                      <Link
                        href={`/category/${category.slug}`}
                        className="flex items-center"
                      >
                        {category.icon ? (
                          (() => {
                            const IconComponent = (LucideIcons as any)[
                              category.icon
                            ]
                            return IconComponent ? (
                              <IconComponent className="h-4 w-4 mr-2" />
                            ) : (
                              <FolderOpenDot className="h-4 w-4 mr-2" />
                            )
                          })()
                        ) : (
                          <FolderOpenDot className="h-4 w-4 mr-2" />
                        )}
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
      <div className="mt-auto p-2">
        <SidebarMenu>
          {footItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url} className="flex items-center">
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>

      <Separator />
      <SidebarFooter className="py-1 h-[50px] flex flex-col items-start justify-center">
        <SignedOut>
          <SignInButton
            mode="modal"
            forceRedirectUrl={'/user-info'}
            signUpForceRedirectUrl={'/user-info'}
          >
            <button className="w-full rounded-full border border-black bg-black px-4 py-1.5 text-sm text-white transition-colors hover:bg-white hover:text-black">
              登录
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </SidebarFooter>
    </Sidebar>
  )
}
