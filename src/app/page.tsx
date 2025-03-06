import NavShowcase from '@/components/nav-showcase'
import { AIAssistantButton } from '@/components/ai-assistant/ai-assistant-button'

export default function Home() {
  return (
    <div>
      {/* 网站导航展示 */}
      <NavShowcase></NavShowcase>

      {/* 添加 AI 助手按钮 */}
      <AIAssistantButton />
    </div>
  )
}
