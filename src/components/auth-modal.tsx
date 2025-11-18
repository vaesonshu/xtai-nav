'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { signIn, signUp } from '@/lib/auth-client'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

const registerSchema = z.object({
  name: z.string().min(1, '请输入用户名'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

interface AuthModalProps {
  children: React.ReactNode
  defaultTab?: 'login' | 'register'
}

export function AuthModal({ children, defaultTab = 'login' }: AuthModalProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true)
      const result = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/user-info',
      })

      if (result.error) {
        toast.error('登录失败: ' + result.error.message)
      } else {
        toast.success('登录成功!')
        setOpen(false)
        loginForm.reset()
      }
    } catch (error) {
      toast.error('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)

      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      console.log('Signup result:', result)

      if (result.error) {
        toast.error('注册失败: ' + result.error.message)
      } else {
        toast.success('注册成功! 请登录')
        setActiveTab('login')
        registerForm.reset()
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>登录 / 注册</DialogTitle>
          <DialogDescription>选择登录现有账户或创建新账户</DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger value="register">注册</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="请输入邮箱地址"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="请输入密码"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="register" className="space-y-4">
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-4"
              >
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>用户名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入用户名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="请输入邮箱地址"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="请输入密码"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '注册中...' : '注册'}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
