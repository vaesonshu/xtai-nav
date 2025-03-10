import VisitCounter from './visit-counter'

export default function Footer() {
  return (
    <footer className="border-t py-4 mt-auto fixed bottom-0">
      <div className="container flex flex-col items-center justify-center gap-2">
        <p className="text-sm text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} 星途 AI 导航. All rights reserved.
        </p>
        <VisitCounter />
      </div>
    </footer>
  )
}
