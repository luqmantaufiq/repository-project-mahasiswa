'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function AuthButton() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setUser(data.user)

        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, nama')
          .eq('id', data.user.id)
          .single()

        setProfile(profileData)
      }

      setLoading(false)
    }

    getSession()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  if (loading) {
    return (
      <div className="rounded-lg border px-5 py-2 text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link
          href="/login"
          className="rounded-lg border px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
        >
          Daftar
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={profile?.role === 'admin' ? '/admin/projects' : '/dashboard'}
        className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
      >
        Dashboard
      </Link>

      <button
        onClick={handleLogout}
        className="rounded-lg border px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  )
}