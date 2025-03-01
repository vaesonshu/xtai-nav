'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { WebsiteCard } from '@/components/nav-card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

// 网站数据
const websites = [
  {
    id: 1,
    name: 'GitHub',
    icon: 'Github' as const,
    description: '全球最大的代码托管平台，提供Git版本控制和协作功能。',
    tags: ['开发', '代码', '开源'],
    url: 'https://github.com',
    category: '开发工具',
  },
  {
    id: 2,
    name: 'Stack Overflow',
    icon: 'HelpCircle' as const,
    description: '程序员问答社区，解决编程问题的最佳去处。',
    tags: ['开发', '问答', '社区'],
    url: 'https://stackoverflow.com',
    category: '开发工具',
  },
  {
    id: 3,
    name: 'MDN Web Docs',
    icon: 'FileText' as const,
    description: 'Mozilla的Web技术文档，提供HTML、CSS和JavaScript的详细指南。',
    tags: ['文档', '前端', '学习'],
    url: 'https://developer.mozilla.org',
    category: '开发工具',
  },
  {
    id: 4,
    name: 'Dribbble',
    icon: 'Palette' as const,
    description: '设计师社区，展示UI、插图、平面设计等创意作品。',
    tags: ['设计', '灵感', '创意'],
    url: 'https://dribbble.com',
    category: '设计资源',
  },
  {
    id: 5,
    name: 'Behance',
    icon: 'Layers' as const,
    description: 'Adobe旗下的创意作品展示平台，汇集全球优秀设计案例。',
    tags: ['设计', '作品集', '创意'],
    url: 'https://behance.net',
    category: '设计资源',
  },
  {
    id: 6,
    name: 'Medium',
    icon: 'BookOpen' as const,
    description: '高质量文章发布平台，涵盖技术、设计、创业等多个领域。',
    tags: ['阅读', '博客', '知识'],
    url: 'https://medium.com',
    category: '内容平台',
  },
  {
    id: 7,
    name: 'Product Hunt',
    icon: 'Rocket' as const,
    description: '发现新产品的平台，每日更新最新科技产品和工具。',
    tags: ['产品', '科技', '发现'],
    url: 'https://producthunt.com',
    category: '内容平台',
  },
  {
    id: 8,
    name: 'Figma',
    icon: 'Figma' as const,
    description: '专业的在线UI设计工具，支持实时协作。',
    tags: ['设计', '工具', '协作'],
    url: 'https://figma.com',
    category: '设计资源',
  },
  {
    id: 9,
    name: 'Vercel',
    icon: 'Triangle' as const,
    description: '现代网站和应用的部署平台，专注于开发者体验。',
    tags: ['部署', '前端', '开发'],
    url: 'https://vercel.com',
    category: '实用工具',
  },
  {
    id: 10,
    name: 'Notion',
    icon: 'FileText' as const,
    description: '一体化的笔记、知识库和项目管理工具。',
    tags: ['工具', '笔记', '协作'],
    url: 'https://notion.so',
    category: '实用工具',
  },
  {
    id: 11,
    name: 'Unsplash',
    icon: 'Image' as const,
    description: '免费高质量图片分享平台，提供可商用的精美照片。',
    tags: ['图片', '资源', '设计'],
    url: 'https://unsplash.com',
    category: '设计资源',
  },
  {
    id: 12,
    name: 'CodePen',
    icon: 'Code' as const,
    description: '前端代码分享社区，可在线编辑和预览HTML、CSS和JavaScript。',
    tags: ['开发', '前端', '示例'],
    url: 'https://codepen.io',
    category: '开发工具',
  },
]

// 获取所有标签
const allTags = Array.from(new Set(websites.flatMap((site) => site.tags)))

// 获取所有分类
const allCategories = Array.from(new Set(websites.map((site) => site.category)))

export default function WebsiteNavigation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 过滤网站
  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag ? website.tags.includes(selectedTag) : true
    const matchesCategory = selectedCategory
      ? website.category === selectedCategory
      : true
    return matchesSearch && matchesTag && matchesCategory
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">星途 AI 工具导航</h1>
        <p className="text-muted-foreground">发现优质网站资源</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="space-y-4 mb-8">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索网站..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            全部分类
          </Badge>
          {allCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            variant={selectedTag === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedTag(null)}
          >
            全部标签
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* 网站卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredWebsites.map((website) => (
          <WebsiteCard key={website.id} website={website} />
        ))}
      </div>

      {filteredWebsites.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          没有找到匹配的网站
        </div>
      )}
    </div>
  )
}
