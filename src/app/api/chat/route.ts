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

    // 将结果转换为数据流响应，并包含推理过程
    return result.toDataStreamResponse({
      // sendReasoning: true,
    })
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
