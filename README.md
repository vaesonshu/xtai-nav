# Next.js入门全栈实战项目 — 星途AI导航

<image src="https://github.com/vaesonshu/xtai-nav/blob/main/public/home.png?raw=true"></image>

## 概述

这是一个使用最新 Next.js 版本构建的一个 AI 导航类项目，主要是收集国内外的一些 AI 技术和应用，希望在使用 AI 应用和开发方面能起到一个导航的作用，在众多的 AI 应用中，快速找到自己需要的应用。

## AI 功能

> 内置 AI Agent，只需要使用自然语言，Agent 就能帮你搜索你需要的网站，然后根据您的选择是否入库此网站，简化自己搜索添加网站繁琐的步骤。

<image src="https://github.com/vaesonshu/xtai-nav/blob/main/public/ai-search.png?raw=true"></image>

> 内置 MCP 管理，您可以根据您的需求，自定义设置您需要的 MCP，AI Agent 会自动识别已开启的 MCP。

<image src="https://github.com/vaesonshu/xtai-nav/blob/main/public/mcp.png?raw=true"></image>

## 快速开始

- 在项目根目录新建 `.env` 文件，复制 `.env.example` 中的内容到 `.env` 文件中，修改其中的环境变量。

- 登录 [supabase](https://supabase.com) 新建一个项目，获取到 `DATABASE_URL`，赋值给 `.env` 文件中的 `DATABASE_URL`，用于连接线上数据库。

- 访问 [better-auth.com](https://www.better-auth.com/docs/installation#set-environment-variables) 官网，点击 `Generate Secret` 按钮，生成一个 `BETTER_AUTH_SECRET`，赋值给 `.env` 文件中对应的环境变量，其中的 `BETTER_AUTH_URL` 赋值为项目的部署地址，例如 `http://xtai-nav.cn`，本地开发测试使用 `http://localhost:3000`。

- `pnpm install` 安装依赖

- `pnpm run db:push` 同步数据库表结构

- `pnpm run dev` 启动项目

## 项目技术栈

### 开发框架

- [Next.js](https://nextjs.org)

### 登录注册

- [better-auth](https://www.better-auth.com)

### 数据库

- [Supabase](https://supabase.com)

### ORM

- [Prisma](https://www.prisma.io)

### 组件库

- [shadcn/ui](https://ui.shadcn.com)
- [sonner](https://sonner.emilkowal.ski)
- [Lucide](https://lucide.dev/icons)

### MCP Server

- [shadcn](https://ui.shadcn.com/docs/mcp)

```bash
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": [
        "shadcn@latest",
        "mcp"
      ]
    }
  }
}
```

### AI 编程助手

- [Cursor](https://cursor.com)

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
- [x] 搜索网站
- [x] 日志记录
- [x] AI Agent 搜集网站
- [x] MCP 配置
- [ ] AI 聊天助手
- [ ] ...

## 项目部署

与 **xtai-notion** 同机时，由 **`xtai-nginx`** 按域名反代（`fenoteai.cn` / `xtai-nav.cn`），本仓库只启动 **`xtai-nav-web`**。完整步骤见 **[DEPLOY.md](./DEPLOY.md)**。

```bash
# 须先启动 xtai-notion
cp .env.example .env
docker compose --env-file .env up -d --build
```

访问：**`https://xtai-nav.cn`**（需先启动 xtai-notion；证书放在本仓库 [`ssl/`](./ssl/README.md)）。

### Docker 常用命令

```bash
docker compose --env-file .env ps
docker compose --env-file .env logs -f
docker compose --env-file .env up -d --build
```

### 服务器前置条件

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
```

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

- 在项目根目录新建 `.github/workflows/deploy.yml` 文件，添加以下内容

```yaml
name: 🚀 Deploy xtai-nav-app to ECS

on:
  push:
    branches:
      - deploy # 推送到 deploy 分支自动部署

jobs:
  deploy:
    name: Deploy to ECS
    runs-on: ubuntu-latest

    steps:
      - name: 🚀 Deploy on Remote ECS
        env:
          PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          HOSTNAME: ${{ secrets.SSH_HOST }}
          USER_NAME: ${{ secrets.SSH_USER }}

        run: |
          echo "$PRIVATE_KEY" > private_key && chmod 600 private_key

          ssh -o StrictHostKeyChecking=no -i private_key ${USER_NAME}@${HOSTNAME} "
            set -e
            echo '➡️ 进入部署目录...'
            cd ~/xtai-nav-app || mkdir -p ~/xtai-nav-app && cd ~/xtai-nav-app

            echo '📦 拉取最新代码...'
            if [ ! -d .git ]; then
              git clone -b deploy git@github.com:${{ github.repository }} .
            else
              git fetch origin deploy && git reset --hard origin/deploy
            fi

            echo '🐳 停止旧容器...'
            docker stop xtai-nav-app || true
            docker rm xtai-nav-app || true

            echo '🧹 删除旧镜像...'
            docker rmi xtai-nav-app || true

            echo '🧱 构建新镜像...'
            docker build -t xtai-nav-app .

            echo '🚀 启动容器...'
            docker run -d \
              --name xtai-nav-app \
              -p 3000:3000 \
              xtai-nav-app

            echo '✅ 部署完成！'
          "

          rm -f private_key
```

## ssh 免密登录（如果需要）

- 在本地终端命令行输入以下命令，将本地公钥复制到服务器，实现免密登录
  - ssh-copy-id user@your-server-ip

## 项目优化
