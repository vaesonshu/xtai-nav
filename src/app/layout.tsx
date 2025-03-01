import type { Metadata } from 'next'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

import './globals.css'

export const metadata: Metadata = {
  title: '星途 AI 工具导航',
  description: 'AI 工具导航，AI 爱好者一站式导航网站，选择 AI 工具不再迷茫！',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 这里的SEO的配置,是作用域所有的页面 className="prose" */}
      <body suppressHydrationWarning>
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
