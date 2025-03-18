# Next.js 全栈实战项目 — 星途 AI 导航

## 概述

这是一个使用最新 Next.js 版本构建的一个 AI 导航类项目，主要是收集国内外的一些 AI 技术和应用，希望在使用 AI 应用方面能起到一个导航的作用，在众多的 AI 应用中，快速找到自己需要的应用。

## 快速开始

- 在项目根目录新建 `.env` 文件，复制 `.env.example` 中的内容到 `.env` 文件中，修改其中的环境变量。

- 登录 [supabase](https://supabase.com) 新建一个项目，获取到 `DATABASE_URL`，赋值给 `.env` 文件中的 `DATABASE_URL`，用于连接线上数据库。

- 登录 [clerk](https://clerk.com) 新建一个项目，获取到 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 和 `CLERK_SECRET_KEY`，赋值给 `.env` 文件中对应的环境变量，用于登录和注册。

- `pnpm install` 安装依赖

- `pnpm run db:push` 同步数据库

- `pnpm run dev` 启动项目

- 更多详细开发教程见我的掘金博客

## 项目技术栈

### 开发框架

- [Next.js](https://nextjs.org)

### 登录注册

- [Clerk](https://clerk.com)

### 数据库

- [Supabase](https://supabase.com)

### ORM

- [Prisma](https://www.prisma.io)

### 组件库

- [shadcn/ui](https://ui.shadcn.com)
- [sonner](https://sonner.emilkowal.ski)
- [Lucide](https://lucide.dev/icons)

## 项目功能点

- [x] 登录
- [x] 注册
- [x] 点赞
- [x] 收藏
- [x] 编辑网站
- [x] 新增网站
- [x] 删除网站
- [x] 更新网站
- [x] 我的收藏
- [x] 个人设置
- [x] 暗黑主题
- [x] 弹幕留言板
- [ ] AI 聊天助手
- [ ] ...
