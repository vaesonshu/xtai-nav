import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createOrUpdateUser } from '@/lib/user-actions'

export default async function DashboardPage() {
  const user = await currentUser()
  console.log('userr------', user)

  await createOrUpdateUser()

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome, {user?.firstName || 'User'}!</CardTitle>
          <CardDescription>
            You have successfully logged in and your information has been saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {user?.imageUrl && (
              <img
                src={user.imageUrl || '/placeholder.svg'}
                alt="Profile"
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
