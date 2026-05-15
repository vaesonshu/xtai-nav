import { deepseek } from '@ai-sdk/deepseek'
import { streamText } from 'ai'

// 允许响应时间最长为 5 分钟
export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // 使用 DeepSeek 模型创建流式文本响应
    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages,
    })

    // AI SDK v6: 使用 toTextStreamResponse 转换为流式文本响应
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
