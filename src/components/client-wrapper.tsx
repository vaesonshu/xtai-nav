'use client'

import { usePathname } from 'next/navigation'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/danmu') ||
    pathname.startsWith('/user-info')

  const { open } = useSidebar()

  return !isAdminPage ? (
    <>
      <AppSidebar />
      <div className="w-full">
        <SidebarHeader
          className={`h-14 flex flex-row items-center bg-background ${open ? 'justify-end' : 'justify-between'} `}
        >
          {!open && <SidebarTrigger className="w-8 h-8" />}
          <div className="self-end">
            <ThemeToggle />
          </div>
        </SidebarHeader>
        {children}
      </div>
    </>
  ) : (
    <main>{children}</main>
  )
}
