import { db } from '@/db/db'
import { GetWebsitesParams } from '@/types/nav-list'

export async function getWebsites(
  { search, category, tag, page, pageSize }: GetWebsitesParams = {
    page: 1,
    pageSize: 10,
  }
) {
  const where: any = {}

  const skip = (page - 1) * pageSize
  const take = pageSize

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { array_contains: search } }, // 使用 array_contains 而不是 has
    ]
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          slug: category, // 使用 slug 而不是 name 进行查询
        },
      },
    }
  }

  if (tag) {
    where.tags = {
      array_contains: tag, // 使用 array_contains 而不是 has
    }
  }

  const [websites, total] = await Promise.all([
    db.website.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: {
          include: { category: true },
        },
      },
      skip,
      take,
    }),
    db.website.count({ where }),
  ])

  return {
    websites,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function getAllTags() {
  const websites = await db.website.findMany({
    select: {
      tags: true,
    },
  })

  // 将所有标签合并为一个数组并去重
  const uniqueTags = [...new Set(websites.flatMap((website) => website.tags))]
  return uniqueTags.sort()
}

export async function getWebsiteById(id: string) {
  return await db.website.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })
}
