'use client'

import type React from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import Link from 'next/link'

type IconName = keyof typeof LucideIcons

interface WebsiteCardProps {
  website: {
    id: number
    name: string
    icon: IconName
    description: string
    tags: string[]
    url: string
    category: string
  }
}

export function WebsiteCard({ website }: WebsiteCardProps) {
  // 使用类型断言来确保图标组件类型正确
  const Icon = (LucideIcons[website.icon] ||
    LucideIcons.Globe) as React.ComponentType<LucideProps>

  return (
    <Link href={website.url} target="_blank" rel="noopener noreferrer">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:scale-105 hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium line-clamp-1">{website.name}</h3>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {website.description}
          </p>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-1">
            {website.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
