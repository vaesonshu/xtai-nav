# xtai-nav.cn 证书目录

阿里云下载后放置：

| 文件              | 说明             |
| ----------------- | ---------------- |
| `xtai-nav.cn.pem` | 证书（含证书链） |
| `xtai-nav.cn.key` | 私钥             |

同机部署时由 **xtai-notion** 的 `xtai-nginx` 挂载（默认 `../xtai-nav/ssl/`）。

**自检（在 xtai-nav 目录）：**

```bash
ls -la ssl/xtai-nav.cn.pem ssl/xtai-nav.cn.key
head -2 ssl/xtai-nav.cn.pem
openssl x509 -in ssl/xtai-nav.cn.pem -noout -subject
```

若 `xtai-nav.cn.pem` 不存在，Docker 会把容器内路径变成空目录，nginx 报 `no start line`。

## 更新证书后（服务器）

```bash
cd /path/to/xtai-notion
docker compose --env-file apps/web/.env restart nginx
curl -Ik https://xtai-nav.cn
```

## 误建成目录（Docker 经典问题）

若 `ls` 显示 `xtai-nav.cn.pem` 为 **directory**，说明曾在证书缺失时启动过 nginx：

```bash
cd /path/to/xtai-nav/ssl
rm -rf xtai-nav.cn.pem xtai-nav.cn.key
# 再放入阿里云下载的真实 .pem / .key 文件
ls -la
head -2 xtai-nav.cn.pem
```

## 自定义路径

在 `xtai-notion/apps/web/.env`：

```env
NAV_DOMAIN=xtai-nav.cn
SSL_NAV_DIR=/绝对路径/xtai-nav/ssl
```

**勿将私钥提交到 Git。**
