import { db } from '@/db/db'

export async function getWebsites() {
  const where = {}
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
