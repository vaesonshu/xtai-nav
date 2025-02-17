import { Metadata } from 'next'

// 修改 <head>
export const metadata: Metadata = {
  title: 'Mine',
}

export default function Page() {
  return <h1>Mine</h1>
}
