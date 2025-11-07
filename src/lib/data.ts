import { db } from '@/db/db'
import { GetWebsitesParams } from '@/types/nav-list'
import { auth } from '@clerk/nextjs/server'
import { type GetWebsitesByCategory } from '@/types/nav-list'

export interface WebsiteWithCategories {
  id: string
  name: string
  url: string
  iconUrl: string
  description: string
  tags: string[]
  views: number
  createdAt: Date
  updatedAt: Date
  likes: any[]
  favorites: any[]
  categories: {
    id: string
    name: string
    slug: string
  }[] // 只包含 category 对象
  hasFavorited: boolean
  hasLiked: boolean
}

// 获取网站列表
export async function getWebsites(
  { search, category, tag, page, pageSize }: GetWebsitesParams = {
    page: 1,
    pageSize: 10,
  }
) {
  const where: any = {}

  // todo: 分页
  const skip = (page - 1) * pageSize
  const take = pageSize

  // 构建查询条件
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } }, // 修改为 has，Prisma 推荐
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
      has: tag, // 修改为 has
    }
  }

  // 获取当前用户
  const { userId: clerkId } = await auth()
  let currentUserId: string | undefined

  if (clerkId) {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })
    currentUserId = user?.id
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
      skip,
      take,
    }),
    db.website.count({ where }),
  ])

  return {
    // 转换数据结构
    websites: websites.map((website) => ({
      ...website,
      categories: website.categories.map((wc) => wc.category), // 提取 category
      hasLiked: currentUserId
        ? website.likes.some((like) => like.userId === currentUserId)
        : false,
      hasFavorited: currentUserId
        ? website.favorites.some(
            (favorite) => favorite.userId === currentUserId
          )
        : false,
    })),
    // 返回分页信息
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

// 通过分类获取网站
export async function getWebsitesByCategory({
  slug,
  page = 1,
  pageSize = 10,
}: GetWebsitesByCategory): Promise<{
  websites: any[]
  categoryName: string
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}> {
  if (!slug) throw new Error('Slug is required')
  if (page < 1 || pageSize < 1)
    throw new Error('Page and pageSize must be positive')

  try {
    // 1. 查询分类
    const category = await db.category.findUnique({
      where: { slug },
      select: { id: true, name: true },
    })

    if (!category) {
      throw new Error(`Category with slug "${slug}" not found`)
    }

    // 2. 分页参数
    const skip = (page - 1) * pageSize
    const take = pageSize

    // 3. 获取总数
    const total = await db.websiteCategory.count({
      where: { categoryId: category.id },
    })

    // 4. 查询网站
    const websites = await db.website.findMany({
      where: {
        categories: {
          some: { categoryId: category.id }, // 筛选属于该分类的网站
        },
      },
      skip,
      take,
      include: {
        categories: {
          include: { category: true },
        },
        likes: true,
        favorites: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // 5. 格式化数据，只保留 category 对象
    const formattedWebsites = websites.map((website) => ({
      ...website,
      categories: website.categories.map((wc) => wc.category), // 提取 category
    }))

    // 6. 计算总页数
    const totalPages = Math.ceil(total / pageSize)

    // 7. 刷新缓存
    // revalidatePath(`/category/${slug}`)

    return {
      websites: formattedWebsites,
      categoryName: category.name,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('Failed to get websites by category:', error)
    throw error
  }
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
