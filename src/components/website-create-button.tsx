'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WebsiteForm } from '@/components/website-form'

export function WebsiteCreateButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        添加网站
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加新网站</DialogTitle>
          </DialogHeader>
          <WebsiteForm onSuccess={() => setOpen(false)} isAdminMode={true} />
        </DialogContent>
      </Dialog>
    </>
  )
}
