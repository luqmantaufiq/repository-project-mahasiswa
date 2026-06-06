'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/admin/projects')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-600">Mengalihkan ke dashboard admin...</p>
    </main>
  )
}