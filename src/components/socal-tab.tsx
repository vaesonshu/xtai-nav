import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Icon } from '@iconify/react'
// import weixin from '@/images/weixin.jpg'

export default function socalTab() {
  return (
    <div className="">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost">
            <Icon icon="simple-icons:wechat" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="">
          <div className="">
            <Image src={''} alt="" width={100} height={100}></Image>
          </div>
        </HoverCardContent>
      </HoverCard>
      <Button variant="ghost">
        <Link href="https://github.com/vaesonshu/xtai-nav" target="_black">
          <Icon icon="logos:github-icon" />
        </Link>
      </Button>
    </div>
  )
}
