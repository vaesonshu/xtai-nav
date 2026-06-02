# xtai-nav 单项目部署（不依赖 xtai-notion）

适用于：**只在一台服务器上部署 xtai-nav**，由本仓库自带的 `xtai-nav-nginx` 处理 80/443。

若与 [xtai-notion](../xtai-notion/README.md) 同机、由 notion 统一反代，请用 [DEPLOY.md](./DEPLOY.md) 中的默认 `docker-compose.yml`。

## 架构

| 组件             | 说明                            |
| ---------------- | ------------------------------- |
| `xtai-nav-nginx` | 反代 + HTTPS（本仓库 `nginx/`） |
| `xtai-nav-web`   | Next.js，仅内网 3000            |

## 前置

1. DNS：`DOMAIN`（如 `xtai-nav.cn`）**A 记录** 指向服务器 IP
2. 安全组：放行 **80、443**
3. 证书放入 `ssl/`（见 [ssl/README.md](./ssl/README.md)）：

   ```
   ssl/xtai-nav.cn.pem
   ssl/xtai-nav.cn.key
   ```

4. 配置环境变量：

   ```bash
   cp .env.example .env
   # 填写 DATABASE_URL、BETTER_AUTH_SECRET 等
   ```

   ```env
   DOMAIN=xtai-nav.cn
   NEXT_PUBLIC_BASE_URL=https://xtai-nav.cn
   BETTER_AUTH_URL=https://xtai-nav.cn
   ```

## 启动

```bash
docker compose -f docker-compose.standalone.yml --env-file .env up -d --build
```

## 验证

```bash
docker compose -f docker-compose.standalone.yml --env-file .env ps
docker compose -f docker-compose.standalone.yml --env-file .env logs nginx --tail 10
curl -I http://xtai-nav.cn
curl -Ik https://xtai-nav.cn
```

## 环境变量（可选）

| 变量               | 默认    | 说明                                        |
| ------------------ | ------- | ------------------------------------------- |
| `NGINX_HTTP_PORT`  | `80`    | HTTP 端口                                   |
| `NGINX_HTTPS_PORT` | `443`   | HTTPS 端口                                  |
| `SSL_DIR`          | `./ssl` | 证书目录（内含 `xtai-nav.cn.pem` / `.key`） |
| `PORT`             | `3000`  | 应用容器内端口（nginx 反代目标）            |

## 更新证书

替换 `ssl/` 下文件后：

```bash
docker compose -f docker-compose.standalone.yml --env-file .env restart nginx
```

## 常用命令

```bash
docker compose -f docker-compose.standalone.yml --env-file .env logs -f web
docker compose -f docker-compose.standalone.yml --env-file .env up -d --build
docker compose -f docker-compose.standalone.yml --env-file .env down
```

## 与 xtai-notion 同机时的区别

| 项           | 同机（默认 compose）        | 单项目（standalone）            |
| ------------ | --------------------------- | ------------------------------- |
| Compose 文件 | `docker-compose.yml`        | `docker-compose.standalone.yml` |
| Nginx        | xtai-notion 的 `xtai-nginx` | 本仓库 `xtai-nav-nginx`         |
| 网络         | `xtai-shared`（external）   | 默认 bridge                     |
| 证书挂载     | notion 挂 `../xtai-nav/ssl` | 本仓库 `./ssl`                  |

**同一台机器不要同时用两种模式暴露 80/443**，会端口冲突。
