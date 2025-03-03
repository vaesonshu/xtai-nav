'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db/db'

export async function createWebsite(data) {
  const { name, url, iconUrl, description, tags } = data

  const website = await db.website.create({
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
