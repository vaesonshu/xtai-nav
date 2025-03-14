'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db/db'
import { auth, clerkClient } from '@clerk/nextjs/server'

interface WebsiteType {
  name: string
  url: string
  iconUrl: string
  description: string
  tags: string[]
  categoryIds: string[]
}

// 新增网站
export async function createWebsite(data: WebsiteType) {
  const { name, url, iconUrl, description, tags, categoryIds } = data

  const website = await db.website.create({
    data: {
      name,
      url,
      iconUrl: iconUrl,
      description: description,
      tags: tags || [],
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
          category: true, // 这样可以在返回结果里直接包含 Category 信息
        },
      },
    },
  })

  console.log('创建website', website)
  return website
}

// 更新网站
export async function updateWebsite(id: string, data: WebsiteType) {
  const { name, url, iconUrl, description, tags, categoryIds } = data
  const website = await db.website.update({
    where: { id },
    data: {
      name,
      url,
      iconUrl: iconUrl,
      description: description,
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
}

// 删除网站
export async function deleteWebsite(id: string) {
  await db.website.delete({
    where: { id },
  })

  revalidatePath('/')
  return { success: true }
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

// 给网站点赞
// export async function incrementLikes(id: string) {
//   const website = await db.website.update({
//     where: { id },
//     data: {
//       likes: {
//         increment: 1,
//       },
//     },
//   })

//   return website.likes
// }

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
  const { name, slug } = data

  const category = await db.category.create({
    data: {
      name,
      slug,
    },
  })

  revalidatePath('/')
  return category
}

// 删除分类
export async function deleteCategory(id: string) {
  await db.category.delete({
    where: { id },
  })

  revalidatePath('/')
  return { success: true }
}

// Helper function to get or create a user
async function getOrCreateUser() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('请先登录')
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    // Instead of creating the user automatically, redirect to a page that will handle user creation
    throw new Error('需要完成账户设置')
  }

  return user
}

// Updated like function to be user-specific
export async function toggleLike(websiteId: string) {
  try {
    const user = await getOrCreateUser()

    // Check if the user has already liked this website
    const existingLike = await db.like.findUnique({
      where: {
        userId_websiteId: {
          userId: user.id,
          websiteId,
        },
      },
    })

    if (existingLike) {
      // If like exists, remove it
      await db.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      // Return the updated like count and liked status
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
          userId: user.id,
          websiteId,
        },
      })

      // Return the updated like count and liked status
      const likeCount = await db.like.count({
        where: {
          websiteId,
        },
      })

      return { count: likeCount, liked: true }
    }
  } catch (error) {
    console.error('点赞失败:', error)
    throw new Error('点赞失败')
  }
}

// New function to toggle favorite status
export async function toggleFavorite(websiteId: string) {
  try {
    const user = await getOrCreateUser()

    // Check if the user has already favorited this website
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_websiteId: {
          userId: user.id,
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
          userId: user.id,
          websiteId,
        },
      })

      revalidatePath('/favorites')
      return { favorited: true }
    }
  } catch (error) {
    console.error('收藏失败:', error)
    throw new Error('收藏失败')
  }
}

// Function to check if a user has liked a website
export async function hasUserLikedWebsite(websiteId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return false
    }

    const like = await db.like.findUnique({
      where: {
        userId_websiteId: {
          userId: user.id,
          websiteId,
        },
      },
    })

    return !!like
  } catch (error) {
    console.error('检查点赞状态失败:', error)
    return false
  }
}

// Function to check if a user has favorited a website
export async function hasUserFavoritedWebsite(websiteId: string) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return false
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return false
    }

    const favorite = await db.favorite.findUnique({
      where: {
        userId_websiteId: {
          userId: user.id,
          websiteId,
        },
      },
    })

    return !!favorite
  } catch (error) {
    console.error('检查收藏状态失败:', error)
    return false
  }
}

// Function to get user's favorite websites
export async function getUserFavorites() {
  try {
    const user = await getOrCreateUser()

    const favorites = await db.favorite.findMany({
      where: {
        userId: user.id,
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
    return []
  }
}
