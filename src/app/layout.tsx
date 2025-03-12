import type { Metadata } from 'next'
import ClientWrapper from '@/components/client-wrapper'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: '星途 AI 导航',
  description: 'AI 工具导航，AI 爱好者一站式导航网站，让选择 AI 工具不再迷茫！',
  icons: {
    icon: '/src/images/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        {/* 这里的SEO的配置,是作用域所有的页面 className="prose" */}
        <body suppressHydrationWarning>
          <ClientWrapper>{children}</ClientWrapper>
        </body>
      </html>
    </ClerkProvider>
  )
}
