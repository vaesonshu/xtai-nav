import VisitCounter from './visit-counter'

export default function Footer() {
  return (
    <div className="border-t py-2 mt-auto fixed bottom-0 w-full h-[60px] flex flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} 星途 AI 导航. All rights reserved.
        </p>
        <VisitCounter />
      </div>
    </div>
  )
}
