import { getUserFavorites } from '@/lib/actions'
import { WebsiteCard } from '@/components/website-card'
import { EmptyFavorites } from '@/components/favorites/empty-favorites'

export async function FavoritesList() {
  const websites = await getUserFavorites()

  if (websites.length === 0) {
    return <EmptyFavorites />
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {websites.map((website) => (
        <WebsiteCard key={website.id} website={website} />
      ))}
    </div>
  )
}
