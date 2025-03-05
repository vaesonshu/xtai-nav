'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { NavCard } from '@/components/nav-card'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import { WebsiteProps } from '@/types/nav-list'

export default function NavMain({ websites }: { websites: WebsiteProps[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // 获取所有标签
  const allTags = Array.from(new Set(websites.flatMap((site) => site.tags)))

  // 获取所有分类（需要遍历所有网站的 categories 数组）
  const allCategories = Array.from(
    new Set(websites.flatMap((site) => site.categories.map((c) => c.name)))
  )

  // 过滤网站
  const filteredWebsites = websites.filter((website) => {
    const matchesSearch =
      website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      website.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag ? website.tags.includes(selectedTag) : true
    const matchesCategory = selectedCategory
      ? website.categories.some((c) => c.name === selectedCategory) // 这里修改为检查 categories 数组
      : true
    return matchesSearch && matchesTag && matchesCategory
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">星途 AI 导航</h1>
        <p className="text-muted-foreground">发现优质 AI 应用网站资源</p>
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
          {allCategories.map((category, index) => (
            <Badge
              key={index}
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
          {allTags.map((tag, index) => (
            <Badge
              key={index}
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
          <NavCard key={website.id} website={website} />
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
