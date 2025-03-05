'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db/db'

export async function createWebsite(data) {
  const { name, url, iconUrl, description, tags, categoryIds } = data

  const website = await db.website.create({
    data: {
      name,
      url,
      iconUrl: iconUrl || null,
      description: description || null,
      tags: tags || [],
      categories: {
        create: categoryIds.map((categoryId) => ({
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
          category: true, // ✅ 这样可以在返回结果里直接包含 Category 信息
        },
      },
    },
  })

  console.log('创建website', website)

  revalidatePath('/')
  return website
}

export async function updateWebsite(id, data) {
  const { name, url, iconUrl, description, tags } = data

  const website = await db.website.update({
    where: { id },
    data: {
      name,
      url,
      iconUrl: iconUrl || null,
      description: description || null,
      tags: tags || [],
    },
  })

  revalidatePath('/')
  return website
}

export async function deleteWebsite(id) {
  await db.website.delete({
    where: { id },
  })

  revalidatePath('/')
  return { success: true }
}

export async function incrementViews(id) {
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
export async function incrementLikes(id) {
  const website = await db.website.update({
    where: { id },
    data: {
      likes: {
        increment: 1,
      },
    },
  })

  return website.likes
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
export async function createCategory(data) {
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
export async function deleteCategory(id) {
  await db.category.delete({
    where: { id },
  })

  revalidatePath('/')
  return { success: true }
}
