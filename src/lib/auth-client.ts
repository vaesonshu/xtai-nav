import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
})

export const { signIn, signUp, useSession, signOut } = authClient

// Client-side hooks for React components
// Custom hook to get current user ID
export function useUserInfo() {
  const { data: session } = useSession()
  return session?.user || null
}

// Hook to check if user is authenticated
export function useIsAuthenticated() {
  const { data: session } = useSession()
  return !!session?.user.id
}

// Server-side helpers (can be used in server actions and API routes)
// Import auth from lib/auth and provide session validation utilities
export async function getServerSession() {
  const { headers } = await import('next/headers')
  const readonlyHeaders = await headers()
  const authHeaders = new Headers(readonlyHeaders)

  const response = await fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/get-session',
    {
      headers: Object.fromEntries(authHeaders.entries()),
    }
  )

  if (response.ok) {
    const session = await response.json()
    return session
  }

  return null
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession()
  return session?.user?.id || null
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('请先登录')
  }
  return userId
}
