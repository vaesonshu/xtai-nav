import { db } from '@/db/db'

export async function getWebsites({ search = '', category = '' }) {
  const where = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ]
  }

  if (category) {
    where.categories = {
      some: {
        category: {
          name: category,
        },
      },
    }
  }

  return await db.website.findMany({
    where,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })
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
