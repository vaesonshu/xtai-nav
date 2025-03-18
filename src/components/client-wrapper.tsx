'use client'

import { usePathname } from 'next/navigation'
import {
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

const ChildWrapper = ({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) => {
  const { open } = useSidebar()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <div className="w-full">
        <SidebarHeader
          className={`h-14 flex flex-row items-center bg-background ${open ? 'justify-end' : 'justify-between'} `}
        >
          {!open && <SidebarTrigger className="w-8 h-8" />}
          <ThemeToggle />
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
