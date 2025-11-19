import { Suspense } from 'react'
import { getWebsites } from '@/lib/data'
import { WebsitesLoading } from '@/components/websites-loading'
import { WebsiteListClient } from './website-list-client'

interface AdminWebsiteListProps {
  search?: string
  allowOperations?: boolean
  allowUserOperations?: boolean
}

export async function AdminWebsiteList({
  search = '',
  allowOperations = false,
  allowUserOperations = true,
}: AdminWebsiteListProps) {
  const data = await getWebsites({
    search,
    approved: false,
    page: 1,
    pageSize: 12,
  })

  return (
    <WebsiteListClient
      initialData={data}
      search={search}
      allowOperations={allowOperations}
      allowUserOperations={allowUserOperations}
    />
  )
}
