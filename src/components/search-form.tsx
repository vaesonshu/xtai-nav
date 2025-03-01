'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams)

    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }

    startTransition(() => {
      router.push(`/?${params.toString()}`)
    })
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="搜索网站..."
        className="pl-8"
        defaultValue={searchParams.get('search') || ''}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}
