'use client'

import { usePathname } from 'next/navigation'
import { PanelLeft } from 'lucide-react'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

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

  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar()

  console.log('state', state)

  return !isAdminPage ? (
    <>
      <AppSidebar />
      <div className="w-full">
        <SidebarHeader className="h-14 flex flex-row items-center bg-background">
          {!open && <SidebarTrigger className="w-8 h-8" />}
        </SidebarHeader>
        {children}
      </div>
    </>
  ) : (
    <main>{children}</main>
  )
}
