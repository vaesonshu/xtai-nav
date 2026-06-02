# xtai-nav.cn 证书目录

阿里云下载后放置：

| 文件              | 说明             |
| ----------------- | ---------------- |
| `xtai-nav.cn.pem` | 证书（含证书链） |
| `xtai-nav.cn.key` | 私钥             |

同机部署时由 **xtai-notion** 的 `xtai-nginx` 挂载（默认 `../xtai-nav/ssl/`）。

## 更新证书后（服务器）

```bash
cd /path/to/xtai-notion
docker compose --env-file apps/web/.env restart nginx
curl -Ik https://xtai-nav.cn
```

## 自定义路径

在 `xtai-notion/apps/web/.env`：

```env
NAV_DOMAIN=xtai-nav.cn
SSL_NAV_CERT=/绝对路径/xtai-nav/ssl/xtai-nav.cn.pem
SSL_NAV_KEY=/绝对路径/xtai-nav/ssl/xtai-nav.cn.key
```

**勿将私钥提交到 Git。**
