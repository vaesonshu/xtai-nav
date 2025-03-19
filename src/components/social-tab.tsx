import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Icon } from '@iconify/react'
import weixin from '@/images/weixin.jpg'

export default function socalTab({ theme }: { theme: string | undefined }) {
  return (
    <div className="">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icon icon="simple-icons:wechat" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-[120px]">
          <Image
            src={weixin}
            alt="微信联系方式"
            width={120}
            height={120}
          ></Image>
        </HoverCardContent>
      </HoverCard>
      <Button variant="ghost" size="icon">
        <Link href="https://github.com/vaesonshu/xtai-nav" target="_black">
          <Icon icon="simple-icons:github" />
        </Link>
      </Button>
    </div>
  )
}
