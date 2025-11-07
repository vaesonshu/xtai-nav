export interface WebsiteProps {
  id: string
  name: string
  iconUrl: string
  description: string
  tags: string[]
  url: string
  categories: WebCategory[]
  likes: any[]
  favorites: any[]
  views: number
  createdAt: Date
  hasFavorited: boolean
  hasLiked: boolean
}

export interface WebCategory {
  [x: string]: any
  id: string
  name: string
  slug: string
  icon?: string
}

export interface GetWebsitesParams {
  search?: string
  category?: string
  tag?: string
  page: number
  pageSize: number
}

// 通过分类获取网站
export interface GetWebsitesByCategory {
  slug: string
  page?: number
  pageSize?: number
}
