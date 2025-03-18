import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Toaster } from 'sonner'
import ClientWrapper from '@/components/client-wrapper'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { zhCN } from '@clerk/localizations'
import { dark, neobrutalism } from '@clerk/themes'
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
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
    <ClerkProvider
      localization={zhCN}
      appearance={{
        // baseTheme: [neobrutalism],
        signIn: {
          baseTheme: neobrutalism,
        },
        signUp: {
          baseTheme: neobrutalism,
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        {/* 这里的SEO的配置,是作用域所有的页面 className="prose" */}
        <body suppressHydrationWarning>
          <SidebarProvider defaultOpen={defaultOpen}>
            <ClientWrapper>{children}</ClientWrapper>
          </SidebarProvider>
          {/* 提示框 */}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
