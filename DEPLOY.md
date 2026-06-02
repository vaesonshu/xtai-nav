# xtai-nav 服务器部署（与 xtai-notion 同机）

> **只部署 xtai-nav、不装 xtai-notion？** 见 [DEPLOY-STANDALONE.md](./DEPLOY-STANDALONE.md)，使用 `docker-compose.standalone.yml`。

公网 **80/443** 由 [xtai-notion](../xtai-notion/README.md) 的 **`xtai-nginx`** 统一处理，按域名分流：

| 域名          | 反代目标            |
| ------------- | ------------------- |
| `fenoteai.cn` | `xtai-web:3000`     |
| `xtai-nav.cn` | `xtai-nav-web:3000` |

本仓库 **不再** 启动独立 Nginx，只运行应用容器 `xtai-nav-web`。

## 架构

| 组件           | 说明                                                           |
| -------------- | -------------------------------------------------------------- |
| `xtai-nav-web` | Next.js，仅加入 `xtai-shared` 网络                             |
| `xtai-nginx`   | 在 xtai-notion 项目中，配置见 `nginx/templates/nav-*.template` |

## 部署顺序

### 1. 配置并启动 xtai-notion（会创建 `xtai-shared` 网络）

```bash
cd /path/to/xtai-notion
cp apps/web/.env.example apps/web/.env
# 填写 DOMAIN=fenoteai.cn、NAV_DOMAIN=xtai-nav.cn 等
# 将本仓库 ssl/ 下占位证书替换为真实证书（见 ssl/README.md）

docker compose --env-file apps/web/.env up -d --build
```

### 2. 配置并启动 xtai-nav

```bash
cd /path/to/xtai-nav
cp .env.example .env
# NEXT_PUBLIC_BASE_URL、BETTER_AUTH_URL 使用 https://xtai-nav.cn（无端口）

docker compose --env-file .env up -d --build
```

### 3. 验证

```bash
curl -I http://xtai-nav.cn      # 301 → https
curl -Ik https://xtai-nav.cn
curl -Ik https://fenoteai.cn
```

## 环境变量（xtai-nav `.env`）

```env
DOMAIN=xtai-nav.cn
NEXT_PUBLIC_BASE_URL=https://xtai-nav.cn
BETTER_AUTH_URL=https://xtai-nav.cn
BETTER_AUTH_SECRET=...
DATABASE_URL=...
```

修改 `NEXT_PUBLIC_BASE_URL` 后需 **重新构建**：`docker compose --env-file .env up -d --build`

## 证书

`xtai-nav.cn` 的证书放在 **本仓库** `ssl/`：

```
ssl/xtai-nav.cn.pem
ssl/xtai-nav.cn.key
```

详见 [ssl/README.md](./ssl/README.md)。更新后于 **xtai-notion** 重启 Nginx：

```bash
cd /path/to/xtai-notion
docker compose --env-file apps/web/.env restart nginx
```

## 域名与安全组

- DNS：`xtai-nav.cn`、`fenoteai.cn` 均 **A 记录** 指向同一 ECS IP
- 安全组：放行 **80、443**（无需 3003/3004）

## 常用命令

```bash
docker compose --env-file .env ps
docker compose --env-file .env logs -f web
docker compose --env-file .env up -d --build
```
