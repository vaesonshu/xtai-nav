'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WebsiteForm } from '@/components/website-form'
import { WebsiteProps } from '@/types/nav-list'

export function WebsiteEditDialog({
  website,
  open,
  onOpenChange,
}: {
  website: WebsiteProps
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑网站</DialogTitle>
        </DialogHeader>
        <WebsiteForm website={website} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
