'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  SidebarTrigger,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import SocialTab from '@/components/social-tab'
import TopBanner from '@/components/top-banner.client'

const ChildWrapper = ({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) => {
  const { theme } = useTheme()
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={setOpen}
    >
      <AppSidebar />
      {/* min-height 与侧栏占位一致，避免主栏高度短于侧栏时错位 */}
      <div className="flex min-h-[calc(100svh-var(--top-banner-offset,0px))] min-w-0 flex-1 flex-col">
        <SidebarHeader
          className={`flex h-14 shrink-0 flex-row items-center ${open ? 'justify-end' : 'justify-between'} `}
        >
          {!open && <SidebarTrigger className="h-8 w-8" />}
          <div className="flex items-center">
            <SocialTab theme={theme} />
            <ThemeToggle />
          </div>
        </SidebarHeader>
        {children}
      </div>
    </SidebarProvider>
  )
}

export default function ClientWrapper({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) {
  const pathname = usePathname()
  const isAdminPage =
    pathname &&
    (pathname.startsWith('/admin') ||
      pathname.startsWith('/danmu') ||
      pathname.startsWith('/user-info'))
  return !isAdminPage ? (
    /* 通告在最外层：fixed 置顶 + 内置占位条同步 --top-banner-offset，与侧栏 top 对齐 */
    <div className="flex min-h-svh w-full flex-col">
      <TopBanner />
      <SidebarProvider className="min-h-0 flex-1">
        <ChildWrapper defaultOpen={defaultOpen}>{children}</ChildWrapper>
      </SidebarProvider>
    </div>
  ) : (
    <main>{children}</main>
  )
}
