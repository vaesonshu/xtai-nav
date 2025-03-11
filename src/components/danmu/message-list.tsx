import type { Message } from '@/types/message'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4 text-indigo-700">留言列表</h2>

      {messages.length === 0 ? (
        <p className="text-center text-slate-500 py-8">暂无留言</p>
      ) : (
        <div className="space-y-4">
          {messages
            .slice()
            .reverse()
            .map((message) => (
              <Card
                key={message.id}
                className={`${
                  message.isAdmin
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
                    : 'bg-white border-slate-200'
                } shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar
                    className={
                      message.isAdmin
                        ? 'border-2 border-amber-400'
                        : 'border border-slate-200'
                    }
                  >
                    <AvatarFallback
                      className={
                        message.isAdmin
                          ? 'bg-amber-400 text-amber-900'
                          : 'bg-indigo-100 text-indigo-700'
                      }
                    >
                      {message.author.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {message.author}
                      {message.isAdmin && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          站长
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(message.timestamp), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-slate-700">
                    {message.content}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
