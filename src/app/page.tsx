import NavShowcase from '@/components/nav-showcase'
import { AIAssistantButton } from '@/components/ai-assistant/ai-assistant-button'
import Footer from '@/components/footer'
export default function Home() {
  return (
    <>
      {/* 网站导航展示 */}
      <NavShowcase></NavShowcase>

      {/* 网站底部 */}
      <div className="flex justify-center">
        <Footer />
      </div>

      {/* 添加 AI 助手按钮 */}
      <AIAssistantButton />
    </>
  )
}
