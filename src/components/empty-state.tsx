import { FileQuestion, Search, RefreshCw } from 'lucide-react'
import { WebsiteCreateButton } from '@/components/website-create-button'
import { Button } from '@/components/ui/button'

export function EmptyState({
  title = '没有找到网站',
  description = '您还没有添加任何网站，或者没有符合搜索条件的网站。',
  onReset,
  showResetButton = false,
}: {
  title?: string
  description?: string
  onReset?: () => void
  showResetButton?: boolean
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        {showResetButton ? (
          <RefreshCw className="h-10 w-10 text-muted-foreground" />
        ) : (
          <Search className="h-10 w-10 text-muted-foreground" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-xl">
        {description}
      </p>
      {showResetButton && onReset ? (
        <Button
          onClick={onReset}
          className="transition-all duration-200 hover:shadow-sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          重置筛选条件
        </Button>
      ) : (
        <WebsiteCreateButton />
      )}
    </div>
  )
}
