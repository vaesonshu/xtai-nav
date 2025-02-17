import { auth, signIn, signOut } from '@/auth'
export default async function SignIn() {
  const session = await auth()

  if (session?.user) {
    return (
      <>
        <div>用户信息：{JSON.stringify(session.user)}</div>
        <div>
          <form
            action={async () => {
              'use server'
              await signOut()
            }}
            className="w-full"
          >
            <button>退出登录</button>
          </form>
        </div>
      </>
    )
  } else {
    return (
      <form
        action={async () => {
          'use server'
          await signIn()
        }}
      >
        <button type="submit">点击登录 GitHub</button>
      </form>
    )
  }
}

// export default function SignIn() {
//   return (
//     <form
//       action={async () => {
//         'use server'
//         await signIn()
//       }}
//     >
//       <button type="submit">Sign In</button>
//     </form>
//   )
// }
