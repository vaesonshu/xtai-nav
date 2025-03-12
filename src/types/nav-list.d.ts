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
}

export interface WebCategory {
  [x: string]: any
  id: string
  name: string
  slug: string
}

export interface GetWebsitesParams {
  search?: string
  category?: string
  tag?: string
  page: number
  pageSize: number
}
