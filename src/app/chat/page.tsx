'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, sendMessage, status, error } = useChat()
  const [inputValue, setInputValue] = useState('')

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m: any) => {
        const text = m.parts
          ? m.parts
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('')
          : m.text || m.content || ''
        return (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === 'user' ? 'User: ' : 'AI: '}
            <p>{text}</p>
          </div>
        )
      })}

      <form
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
        onSubmit={(e) => {
          e.preventDefault()
          if (inputValue.trim()) {
            sendMessage({ text: inputValue })
            setInputValue('')
          }
        }}
      >
        <input
          className="w-full p-2"
          value={inputValue}
          disabled={status === 'streaming'}
          placeholder="Say something..."
          onChange={(e) => setInputValue(e.target.value)}
        />
      </form>
    </div>
  )
}
