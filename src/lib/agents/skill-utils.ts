import { readdir, readFile } from 'fs/promises'
import path from 'path'

/** 与官网「Add Skills to Your Agent」一致的元信息结构 */
export interface SkillMetadata {
  name: string
  description: string
  /** 技能根目录绝对路径，其下包含 SKILL.md */
  path: string
}

/** 简易解析 SKILL.md 顶部 YAML frontmatter（仅依赖 name / description 行） */
export function parseSkillFrontmatter(content: string): {
  name: string
  description: string
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match?.[1]) throw new Error('缺少 YAML frontmatter')
  const block = match[1]
  const name = block.match(/^name:\s*(.+)$/m)?.[1]?.trim()
  const description = block.match(/^description:\s*(.+)$/m)?.[1]?.trim()
  if (!name || !description)
    throw new Error('frontmatter 需包含 name 与 description')
  return { name, description }
}

/** 去掉 frontmatter，仅保留 Markdown 正文给模型阅读 */
export function stripSkillFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/)
  return match ? content.slice(match[0].length).trim() : content.trim()
}

/**
 * 扫描目录下每个子文件夹内的 SKILL.md，提取元数据（渐进披露：只把 name/description 喂给系统提示）。
 */
export async function discoverSkills(
  skillsRootDir: string
): Promise<SkillMetadata[]> {
  const skills: SkillMetadata[] = []
  const seenNames = new Set<string>()

  let entries
  try {
    entries = await readdir(skillsRootDir, { withFileTypes: true })
  } catch {
    return []
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const skillDir = path.join(skillsRootDir, entry.name)
    const skillFile = path.join(skillDir, 'SKILL.md')
    try {
      const content = await readFile(skillFile, 'utf-8')
      const frontmatter = parseSkillFrontmatter(content)
      if (seenNames.has(frontmatter.name)) continue
      seenNames.add(frontmatter.name)
      skills.push({
        name: frontmatter.name,
        description: frontmatter.description,
        path: skillDir,
      })
    } catch {
      continue
    }
  }

  return skills
}

/** 拼入系统提示的「可用技能」列表，引导模型在合适时调用 loadSkill */
export function buildSkillsPromptSection(skills: SkillMetadata[]): string {
  if (skills.length === 0) return ''
  const lines = skills.map((s) => `- ${s.name}: ${s.description}`).join('\n')
  return `
## Skills

当用户问题需要专项流程或外网检索规范时，先使用 \`loadSkill\` 加载对应技能说明，再按正文执行。

可用技能：
${lines}
`.trim()
}

/** 项目内技能根目录（相对于仓库根） */
export function getWebsiteSearchSkillsRoot(): string {
  return path.join(process.cwd(), 'src', 'lib', 'agents', 'skills')
}
