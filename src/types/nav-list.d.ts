export interface NavCardProps {
  id: number
  name: string
  iconUrl?: string
  description: string
  tags: string[]
  url: string
  categories: string[]
  likes?: number
  views: number
}

export interface webCategory {
  id: number
  name: string
}

export interface GetWebsitesParams {
  search?: string
  category?: string
  tag?: string
  page: number
  pageSize: number
}
