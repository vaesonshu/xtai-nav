'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db/db'
import { getCurrentUserId } from '@/lib/auth-client'

interface WebsiteType {
  name: string
  url: string
  iconUrl: string | null
  description: string | null
  tags: string[]
  categoryIds: string[]
}

// 新增网站（用户提交，待审批）
export async function submitWebsite(data: WebsiteType) {
  const userId = await getCurrentUserId()
  console.log('submitWebsite userId', userId)
  if (!userId) {
    return { success: false, message: '请先登录' }
  }

  const { name, url, iconUrl, description, tags, categoryIds } = data

  try {
    const website = await db.website.create({
      data: {
        name,
        url,
        iconUrl: iconUrl || '',
        description: description || '',
        tags: tags || [],
        approvalStatus: 'pending',
        isApproved: false,
        submittedBy: userId,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: {
                id: categoryId,
              },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    console.log('提交website等待审批', website)
    revalidatePath('/')
    revalidatePath('/admin')
    return website
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('url')) {
      return {
        success: false,
        message: `网站链接 "${url}" 已存在，请使用其他链接`,
      }
    }
    throw error
  }
}

// 新增网站（管理员直接创建并审批通过）
export async function adminCreateWebsite(data: WebsiteType) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { success: false, message: '请先登录' }
  }

  const { name, url, iconUrl, description, tags, categoryIds } = data

  try {
    const website = await db.website.create({
      data: {
        name,
        url,
        iconUrl: iconUrl || '',
        description: description || '',
        tags: tags || [],
        approvalStatus: 'approved',
        isApproved: true,
        approvedAt: new Date(),
        submittedBy: userId,
        approvedBy: userId,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: {
                id: categoryId,
              },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    console.log('管理员创建website并自动审批通过', website)
    return website
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('url')) {
      return {
        success: false,
        message: `网站链接 "${url}" 已存在，请使用其他链接`,
      }
    }
    return { success: false, message: error.message }
  }
}

// 审批网站（管理员操作）
export async function approveWebsite(websiteId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { success: false, message: '请先登录' }
  }

  const website = await db.website.update({
    where: { id: websiteId },
    data: {
      approvalStatus: 'approved',
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: userId,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin')
  return website
}

// 拒绝网站（管理员操作）
export async function rejectWebsite(websiteId: string, rejectReason: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { success: false, message: '请先登录' }
  }

  const website = await db.website.update({
    where: { id: websiteId },
    data: {
      approvalStatus: 'rejected',
      isApproved: false,
      rejectReason,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin')
  return website
}

// 获取待审批的网站
export async function getPendingWebsites() {
  return await db.website.findMany({
    where: {
      approvalStatus: 'pending',
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

// 获取用户提交的网站（支持分页）
export async function getUserSubmittedWebsites(
  page: number = 1,
  limit: number = 10
) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { websites: [], total: 0, totalPages: 0, currentPage: page }
  }

  const skip = (page - 1) * limit

  const [websites, total] = await Promise.all([
    db.website.findMany({
      where: {
        submittedBy: userId,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    db.website.count({
      where: {
        submittedBy: userId,
      },
    }),
  ])

  return {
    websites,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  }
}

// 删除用户提交的网站（只允许删除未审批通过的网站）
export async function deleteUserWebsite(websiteId: string) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { success: false, message: '请先登录' }
  }

  const website = await db.website.findUnique({
    where: { id: websiteId },
  })

  if (!website) {
    return { success: false, message: '网站不存在' }
  }

  if (website.submittedBy !== userId) {
    return { success: false, message: '无权限删除此网站' }
  }

  // 允许用户删除任何状态的网站

  await db.website.delete({
    where: { id: websiteId },
  })

  return { success: true, message: '网站删除成功' }
}

// 更新网站（用户只能更新未审批通过的网站）
export async function updateUserWebsite(id: string, data: WebsiteType) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { success: false, message: '请先登录' }
  }

  const { name, url, iconUrl, description, tags, categoryIds } = data

  // 首先检查网站是否存在且属于当前用户
  const existingWebsite = await db.website.findUnique({
    where: { id },
  })

  if (!existingWebsite) {
    return { success: false, message: '网站不存在' }
  }

  if (existingWebsite.submittedBy !== userId) {
    return { success: false, message: '无权限编辑此网站' }
  }

  if (existingWebsite.approvalStatus === 'approved') {
    return { success: false, message: '已审批通过的网站无法编辑，请联系管理员' }
  }

  try {
    const website = await db.website.update({
      where: { id },
      data: {
        name,
        url,
        iconUrl: iconUrl || '',
        description: description || '',
        tags: tags,
        approvalStatus: 'pending', // 用户修改网站后需要重新审核
        isApproved: false,
        categories: {
          deleteMany: {}, // 删除所有旧关联
          create: categoryIds.map((categoryId: string) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        categories: { include: { category: true } }, // 返回更新后的分类
      },
    })

    return website
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('url')) {
      return {
        success: false,
        message: `网站链接 "${url}" 已存在，请使用其他链接`,
      }
    }
    return { success: false, message: error.message }
  }
}

// 保留原有的 updateWebsite 函数供管理员使用
export async function updateWebsite(id: string, data: WebsiteType) {
  const { name, url, iconUrl, description, tags, categoryIds } = data

  try {
    const website = await db.website.update({
      where: { id },
      data: {
        name,
        url,
        iconUrl: iconUrl || '',
        description: description || '',
        tags: tags,
        categories: {
          deleteMany: {}, // 删除所有旧关联
          create: categoryIds.map((categoryId: string) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: {
        categories: { include: { category: true } }, // 返回更新后的分类
      },
    })

    return website
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('url')) {
      return {
        success: false,
        message: `网站链接 "${url}" 已存在，请使用其他链接`,
      }
    }
    return { success: false, message: error.message }
  }
}

// 删除网站
export async function deleteWebsite(id: string) {
  await db.website.delete({
    where: { id },
  })

  revalidatePath('/')
  revalidatePath('/admin')
}

// 网站浏览量加一
export async function incrementViews(id: string) {
  const website = await db.website.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  })

  return website.views
}

// 获取分类
export async function getCategories() {
  return await db.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}

// 创建分类
export async function createCategory(data: any) {
  const { name, slug, icon } = data

  try {
    const category = await db.category.create({
      data: {
        name,
        slug,
        icon,
      },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    return category
  } catch (error: any) {
    // Add more context to the error before propagating it
    if (error.code === 'P2002') {
      // This is a Prisma unique constraint error
      if (error.meta?.target?.includes('name')) {
        return {
          success: false,
          message: `分类名称 "${name}" 已存在，请使用不同的名称`,
        }
      } else if (error.meta?.target?.includes('slug')) {
        return {
          success: false,
          message: `分类别名 "${slug}" 已存在，请使用不同的别名`,
        }
      }
    }
    // Re-throw the original error if it's not a unique constraint error or we couldn't add more context
    return { success: false, message: error.message }
  }
}

// 删除分类
export async function deleteCategory(id: string) {
  await db.category.delete({
    where: { id },
  })

  revalidatePath('/')
  return { success: true }
}

// 点赞网站
export async function toggleLike(websiteId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('请先登录')
    }

    const existingLike = await db.like.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId,
        },
      },
    })

    if (existingLike) {
      await db.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      const likeCount = await db.like.count({
        where: {
          websiteId,
        },
      })

      return { count: likeCount, liked: false }
    } else {
      // If like doesn't exist, create it
      await db.like.create({
        data: {
          userId,
          websiteId,
        },
      })

      const likeCount = await db.like.count({
        where: {
          websiteId,
        },
      })

      return { count: likeCount, liked: true }
    }
  } catch (error) {
    console.error('点赞失败:', error)
    throw error
  }
}

// 收藏网站
export async function toggleFavorite(websiteId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      throw new Error('请先登录')
    }

    // Check if the user has already favorited this website
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_websiteId: {
          userId,
          websiteId,
        },
      },
    })

    if (existingFavorite) {
      // If favorite exists, remove it
      await db.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      })

      revalidatePath('/favorites')
      return { favorited: false }
    } else {
      // If favorite doesn't exist, create it
      await db.favorite.create({
        data: {
          userId,
          websiteId,
        },
      })

      revalidatePath('/favorites')
      return { favorited: true }
    }
  } catch (error) {
    throw error
  }
}

// 获取用户收藏列表
export async function getUserFavorites() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { success: false, message: '请先登录或完成账户设置' }
    }

    const favorites = await db.favorite.findMany({
      where: {
        userId,
      },
      include: {
        website: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
            likes: true,
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return favorites.map((favorite) => favorite.website)
  } catch (error) {
    console.error('获取收藏失败:', error)
    return { success: false, message: '获取收藏失败' }
  }
}
