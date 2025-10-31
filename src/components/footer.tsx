import VisitCounter from './visit-counter'

export default function Footer() {
  return (
    <div className="border-t border-solid py-1 w-full flex flex-col items-center justify-center fixed bottom-0 bg-background h-[50px]">
      <div className="container flex flex-col items-center justify-center">
        <p className="text-[12px] text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} 星途 AI 导航. All rights reserved.
        </p>
        <VisitCounter />
      </div>
    </div>
  )
}
