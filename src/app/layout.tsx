import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Toaster } from 'sonner'
import ClientWrapper from '@/components/client-wrapper'
// No provider needed for better-auth - authentication handled through sessions
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: '星途 AI 导航',
  description: 'AI 工具导航，AI 爱好者一站式导航网站，让选择 AI 工具不再迷茫！',
  icons: {
    icon: '/src/images/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const sidebarState = cookieStore.get('sidebar_state')?.value
  const defaultOpen =
    sidebarState !== undefined ? sidebarState === 'true' : true

  return (
    <html lang="en" suppressHydrationWarning>
      {/* 这里的SEO的配置,是作用域所有的页面 className="prose" */}
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientWrapper defaultOpen={defaultOpen}>{children}</ClientWrapper>
        </ThemeProvider>
        {/* 提示框 */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
