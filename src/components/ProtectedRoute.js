'use client' // Add this for App Router
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation' // Use 'next/router' for Pages Router
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return 

    if (!session) {
      router.push('/auth/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return children
}