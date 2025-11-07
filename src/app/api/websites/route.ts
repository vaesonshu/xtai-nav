import { NextRequest, NextResponse } from 'next/server'
import { getWebsites } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const tag = searchParams.get('tag') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    const result = await getWebsites({
      search,
      category,
      tag,
      page,
      pageSize,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch websites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    )
  }
}
