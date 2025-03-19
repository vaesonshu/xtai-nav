'use client'

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

const ChildWrapper = ({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) => {
  const { theme } = useTheme()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className="w-full">
        <SidebarHeader
          className={`h-14 flex flex-row items-center bg-background ${defaultOpen ? 'justify-end' : 'justify-between'} `}
        >
          {!defaultOpen && <SidebarTrigger className="w-8 h-8" />}
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
