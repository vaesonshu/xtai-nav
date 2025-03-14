import { getWebsitesByCategory } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavCard } from '@/components/nav-card'

interface CategoryPageProps {
  params: { slug: string }
  searchParams: { page?: string }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1', 10)

  let result
  try {
    result = await getWebsitesByCategory({
      slug,
      page,
      pageSize: 10,
    })
    console.log(result)
  } catch (error) {
    return notFound()
  }

  const { websites, pagination, categoryName } = result

  return (
    <div className="container flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
        {categoryName}
      </h1>
      <div className="">
        {websites.length === 0 ? (
          <p className="text-muted-foreground">该分类下暂无网站</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {websites.map((website) => (
              <NavCard key={website.id} website={website} />
            ))}
          </div>
        )}
      </div>

      {/* {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          {page > 1 && (
            <Button asChild variant="outline">
              <Link href={`/category/${slug}?page=${page - 1}`}>上一页</Link>
            </Button>
          )}
          <span className="self-center">
            第 {page} 页 / 共 {totalPages} 页 (总数: {total})
          </span>
          {page < totalPages && (
            <Button asChild variant="outline">
              <Link href={`/category/${slug}?page=${page + 1}`}>下一页</Link>
            </Button>
          )}
        </div>
      )} */}
    </div>
  )
}
