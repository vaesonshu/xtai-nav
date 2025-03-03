import { getWebsites } from '@/lib/data'
import { WebsiteShowcaseCard } from '@/components/website-showcase-card'

export async function WebsiteShowcase({
  search = '',
  tag = '',
}: {
  search?: string
  tag?: string
}) {
  const websites = await getWebsites({ search, tag })

  if (websites.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">暂无相关网站</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {websites.map((website) => (
        <WebsiteShowcaseCard key={website.id} website={website} />
      ))}
    </div>
  )
}
