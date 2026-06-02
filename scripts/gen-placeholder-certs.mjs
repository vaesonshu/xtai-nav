/**
 * 生成 xtai-nav.cn 占位自签名证书，输出到项目 ssl/ 目录
 * 优先调用本机 openssl；否则提示使用 Python 脚本
 */
import { execSync, spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'ssl')
mkdirSync(outDir, { recursive: true })

const hasOpenssl =
  spawnSync('openssl', ['version'], { shell: true }).status === 0
if (hasOpenssl) {
  execSync(
    `openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout "${join(outDir, 'xtai-nav.cn.key')}" -out "${join(outDir, 'xtai-nav.cn.pem')}" -subj "/CN=xtai-nav.cn/O=placeholder"`,
    { stdio: 'inherit', shell: true }
  )
  console.log('已生成:', outDir)
} else {
  console.error(
    '未找到 openssl，请运行: python scripts/gen-placeholder-certs.py'
  )
  process.exit(1)
}
