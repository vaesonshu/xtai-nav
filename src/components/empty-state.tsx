import { FileQuestion } from 'lucide-react'
import { WebsiteCreateButton } from '@/components/website-create-button'

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">没有找到网站</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xs">
        您还没有添加任何网站，或者没有符合搜索条件的网站。
      </p>
      <WebsiteCreateButton />
    </div>
  )
}
