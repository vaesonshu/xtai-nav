import { Suspense } from 'react'
import { getMessages } from '@/lib/message-actions'
import MessageForm from '@/components/message-board/message-form'
import MessageList from '@/components/message-board/message-list'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db/db'

export const metadata = {
  title: '留言板 | AI 导航',
  description: '在这里留下您的想法和建议',
}

async function getUserInfo() {
  const { userId } = await auth()

  if (!userId) {
    return { isLoggedIn: false, isAdmin: false, user: null, avatarUrl: null }
  }

  const [user, clerkUser] = await Promise.all([
    db.user.findUnique({
      where: { clerkId: userId },
    }),
    currentUser(),
  ])

  return {
    isLoggedIn: true,
    isAdmin: user?.role === 'ADMIN',
    user,
    avatarUrl: clerkUser?.imageUrl || null,
  }
}

export default async function MessageBoardPage(props: {
  searchParams: Promise<{ page?: number }>
}) {
  const searchParams = await props.searchParams
  const { page } = searchParams
  // const page = Number.parseInt(searchParams.page ?? '1')
  const { success, messages, pagination } = await getMessages(page, 10, null)
  const { isLoggedIn, isAdmin, user, avatarUrl } = await getUserInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">留言板</h1>
            <p className="text-lg text-gray-600">
              欢迎在这里留下您的想法、建议或问题，我们非常重视您的反馈！
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                {isLoggedIn
                  ? isAdmin
                    ? '以管理员身份留言'
                    : '以用户身份留言'
                  : '留下您的想法'}
              </h2>

              <MessageForm
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                userName={user?.name || ''}
                avatarUrl={avatarUrl}
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                留言列表
              </h2>

              <Suspense
                fallback={<div className="text-center py-8">加载留言中...</div>}
              >
                <MessageList
                  messages={messages || []}
                  pagination={pagination || { total: 0, pages: 1, current: 1 }}
                  isAdmin={isAdmin}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
