import Link from 'next/link'
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-64 w-64 rounded-full bg-purple-100 opacity-40 blur-3xl"></div>
        <div className="absolute -right-4 top-1/3 h-64 w-64 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 h-64 w-64 rounded-full bg-indigo-100 opacity-40 blur-3xl"></div>
      </div>

      {/* Large Icon at the top */}
      <div className="relative mb-8">
        <div className="absolute -left-6 -top-6 h-12 w-12 rounded-full bg-purple-100"></div>
        <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-blue-100"></div>
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-6 shadow-lg">
          <FileQuestion className="h-16 w-16 text-white animate-pulse" />
        </div>
      </div>

      <div className="relative max-w-lg w-full">
        <Card className="mx-auto overflow-hidden border-none bg-white/80 shadow-xl backdrop-blur-sm">
          <div className="absolute -right-8 -top-8 h-16 w-16 rotate-12 rounded-md bg-purple-100"></div>
          <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-blue-50"></div>

          <CardHeader className="space-y-1 text-center pb-2">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-50 to-purple-100 p-2 shadow-inner">
              <Search className="h-12 w-12 text-purple-500" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
              页面未找到
            </CardTitle>
            <CardDescription className="text-lg">
              您访问的页面不存在
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col gap-3 sm:flex-row pb-6">
            <Button
              asChild
              variant="outline"
              className="w-full group border border-slate-200 hover:bg-slate-50"
            >
              <Link
                href="javascript:history.back()"
                className="flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                返回上一页
              </Link>
            </Button>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              <Link href="/" className="flex items-center justify-center">
                <Home className="mr-2 h-5 w-5 animate-bounce" />
                返回首页
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
