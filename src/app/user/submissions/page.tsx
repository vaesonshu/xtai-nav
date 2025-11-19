import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUserId } from '@/lib/auth-client'
import { getUserSubmittedWebsites } from '@/lib/actions'
import { Clock, Check, X, FileText, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          待审批
        </Badge>
      )
    case 'approved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          已通过
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          已拒绝
        </Badge>
      )
    default:
      return <Badge variant="outline">未知状态</Badge>
  }
}

export default async function UserSubmissionsPage() {
  const userId = await getCurrentUserId()

  if (!userId) {
    redirect('/')
  }

  const submissions = await getUserSubmittedWebsites()

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            我的网站提交
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            查看您提交的所有网站及其审批状态。
          </p>
        </div>

        {submissions.websites.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无提交记录
              </h3>
              <p className="text-gray-600 mb-4">
                您还没有提交过网站，快去首页提交一个吧！
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                返回首页
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6">
              {submissions.websites.map((website) => (
                <Card
                  key={website.id}
                  className="bg-white border-gray-200 shadow-sm"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={website.iconUrl || '/default-icon.png'}
                          alt={website.name}
                          className="w-8 h-8 rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/default-icon.png'
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg">
                            {website.name}
                          </CardTitle>
                          <Link
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            {website.url}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                        </div>
                      </div>
                      {getStatusBadge(website.approvalStatus)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600">
                          <strong>描述:</strong> {website.description}
                        </p>
                      </div>

                      {website.tags && website.tags.length > 0 && (
                        <div>
                          <strong className="text-gray-600">标签:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {website.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {website.categories && website.categories.length > 0 && (
                        <div>
                          <strong className="text-gray-600">分类:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {website.categories.map((cat) => (
                              <Badge
                                key={cat.category.id}
                                className="bg-blue-100 text-blue-800 text-xs"
                              >
                                {cat.category.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-sm text-gray-500">
                          提交时间:{' '}
                          {new Date(website.createdAt).toLocaleString('zh-CN')}
                        </span>

                        {website.approvalStatus === 'rejected' &&
                          website.rejectReason && (
                            <div className="text-right">
                              <span className="text-sm font-medium text-red-600">
                                拒绝原因:
                              </span>
                              <p className="text-sm text-red-600 mt-1 max-w-md">
                                {website.rejectReason}
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
