export interface WebsiteProps {
  id: number
  name: string
  iconUrl?: string
  description: string
  tags: string[]
  url: string
  categories: WebCategory[]
  likes?: number
  views: number
}

export interface WebCategory {
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
