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

## 项目部署

### Nginx 配置

```nginx
server {
    listen 80;
    server_name xtainav.cn www.xtainav.cn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name xtainav.cn www.xtainav.cn;
    ssl_certificate /etc/nginx/certs/xtainav.cn_bundle.crt;
    ssl_certificate_key /etc/nginx/certs/xtainav.cn.key;
    location / {
        proxy_pass http://xtai-nav-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker 部署

> 停止现有容器

- `docker compose down`

> 构建并运行 Docker 容器

- docker build -t xtai-nav-app .
- docker run -p 3000:3000 xtai-nav-app

常用命令

> 强制重新构建镜像并在后台运行

- `docker compose up -d --build`

> 检查容器状态

- `docker compose ps`

> 检查日志

- `docker logs xtai-nav-app`
- `docker logs nginx`

> 测试 HTTPS

- `curl -I https://xtainav.cn`

### Github Actions

## 1. Ubuntu 生成 SSH Key

- 在服务器的终端命令行输入 `ssh-keygen -t rsa -b 4096 -C "deploy@yourdomain.com" -P "" -f ~/.ssh/id_rsa`
  - 私钥保存到：`~/.ssh/id_rsa`
  - 公钥保存到：`~/.ssh/id_rsa.pub`
  - 查看并复制公钥：`cat ~/.ssh/id_rsa.pub` 添加到 [Github 仓库的 SSH Keys](https://github.com/settings/keys)

## 2. 配置 Github Actions Secrets

- 在 Github 仓库页面，点击 `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`
  - 添加以下 Secrets：
    - `SSH_PRIVATE_KEY`：将 `~/.ssh/id_rsa` 的内容复制到该 Secret 中。PS: `cat ~/.ssh/id_rsa` 查看私钥内容
    - `SERVER_HOST`：服务器的 IP 地址。PS: `ifconfig` 查看 IP 地址
    - `SSH_USER`：服务器用户名

## 3. 配置 Github Actions 工作流

- 在项目根目录新建 `.github/workflows/deploy.yml` 文件，添加以下

```yaml
name: Deploy to Server
```

## ssh 免密登录（如果需要）

- 在本地终端命令行输入以下命令，将本地公钥复制到服务器，实现免密登录
  - ssh-copy-id user@your-server-ip

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
- [x] 侧边栏导航
- [x] 弹幕留言板
- [x] AI 聊天助手
- [ ] ...

## 项目优化
