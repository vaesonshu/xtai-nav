// 'use client'

// import { useRouter, useSearchParams } from 'next/navigation'
// import { Badge } from '@/components/ui/badge'
// import { getAllTags } from '@/lib/data'

// export async function TagList() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const currentTag = searchParams.get('tag')
//   const tags = await getAllTags()

//   const handleTagClick = (tag: string) => {
//     const params = new URLSearchParams(searchParams)
//     if (currentTag === tag) {
//       params.delete('tag')
//     } else {
//       params.set('tag', tag)
//     }
//     router.push(`/showcase?${params.toString()}`)
//   }

//   return (
//     <div className="flex flex-wrap gap-2">
//       {tags.map((tag) => (
//         <Badge
//           key={tag}
//           variant={currentTag === tag ? 'default' : 'secondary'}
//           className="cursor-pointer hover:bg-secondary/80"
//           onClick={() => handleTagClick(tag)}
//         >
//           {tag}
//         </Badge>
//       ))}
//     </div>
//   )
// }
