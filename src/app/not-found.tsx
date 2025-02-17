'use clie'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center h-screen justify-center">
      <h2>Not Found</h2>
      <Link href="/">Return Home</Link>
    </div>
  )
}
