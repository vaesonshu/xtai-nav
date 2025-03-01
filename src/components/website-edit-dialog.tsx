'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WebsiteForm } from '@/components/website-form'

export function WebsiteEditDialog({ website, open, onOpenChange }) {
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
