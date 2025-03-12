import { db } from '@/db/db'
import { GetWebsitesParams } from '@/types/nav-list'
import { auth } from '@clerk/nextjs/server'

// 获取网站列表
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
        likes: true,
        favorites: true,
      },
      // skip,
      // take,
    }),
    db.website.count({ where }),
  ])

  return {
    // 转换数据结构
    websites: websites.map((website) => ({
      ...website,
      categories: website.categories.map((wc) => wc.category), // 提取 category
    })),
    // 返回分页信息
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }

  // return websites.map((website) => ({
  //   ...website,
  //   categories: website.categories.map((wc) => wc.category),
  // }))

  // todo 分页
  // return {
  //   websites,
  //   pagination: {
  //     total,
  //     page,
  //     pageSize,
  //     totalPages: Math.ceil(total / pageSize),
  //   },
  // }
}

// 获取所有标签
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

// 获取网站详情
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

// 获取当前用户信息
export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  return user
}
