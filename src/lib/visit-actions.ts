'use server'

import { db } from '@/db/db'
import { headers } from 'next/headers'

export async function incrementVisitCount() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  const referer = headersList.get('referer') || '/'
  const path = new URL(referer).pathname

  // Always record the visit for analytics purposes
  await db.visit.create({
    data: {
      ip,
      userAgent,
      path,
    },
  })

  // Check if this IP has visited before
  const existingVisitor = await db.uniqueVisitor.findUnique({
    where: { ip },
  })

  let isNewVisitor = false

  if (existingVisitor) {
    // Update the existing visitor's last visit time and count
    await db.uniqueVisitor.update({
      where: { ip },
      data: {
        lastVisit: new Date(),
        visitCount: { increment: 1 },
      },
    })
  } else {
    // This is a new unique visitor
    await db.uniqueVisitor.create({
      data: {
        ip,
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
      },
    })
    isNewVisitor = true
  }

  // Update the stats counter - only increment uniqueCount for new visitors
  const stats = await db.visitStats.upsert({
    where: { id: 'singleton' },
    update: {
      count: { increment: 1 },
      uniqueCount: isNewVisitor ? { increment: 1 } : undefined,
    },
    create: {
      id: 'singleton',
      count: 1,
      uniqueCount: 1,
    },
  })

  return {
    totalVisits: stats.count,
    uniqueVisitors: stats.uniqueCount,
  }
}

export async function getVisitStats() {
  const stats = await db.visitStats.findUnique({
    where: { id: 'singleton' },
  })

  return {
    totalVisits: stats?.count || 0,
    uniqueVisitors: stats?.uniqueCount || 0,
  }
}
