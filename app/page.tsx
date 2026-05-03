import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'

/** Root "/" redirects to dashboard if authenticated, else to login */
export default async function Home() {
  const user = await getAuthUser()
  if (user) redirect('/dashboard')
  else redirect('/login')
}
