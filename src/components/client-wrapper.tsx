'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  SidebarTrigger,
  SidebarHeader,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import SocialTab from '@/components/social-tab'

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
      <div className="w-full">
        <SidebarHeader
          className={`h-14 flex flex-row items-center bg-background ${open ? 'justify-end' : 'justify-between'} `}
        >
          {!open && <SidebarTrigger className="w-8 h-8" />}
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
    pathname.startsWith('/admin') ||
    pathname.startsWith('/danmu') ||
    pathname.startsWith('/user-info')
  return !isAdminPage ? (
    <SidebarProvider>
      <ChildWrapper defaultOpen={defaultOpen}>{children}</ChildWrapper>
    </SidebarProvider>
  ) : (
    <main>{children}</main>
  )
}
