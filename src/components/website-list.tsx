import { getWebsites } from '@/lib/data'
import { WebsiteCard } from '@/components/website-card'
import { EmptyState } from '@/components/empty-state'

export async function WebsiteList({
  search = '',
  category = '',
}: {
  search?: string
  category?: string
}) {
  const { websites } = await getWebsites()
  console.log('获取', websites)

  if (websites.length === 0) {
    return <EmptyState />
  }

  return (
    // className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    <div className="">
      {websites.map((website) => (
        <WebsiteCard key={website.id} website={website} />
      ))}
    </div>
  )
}
