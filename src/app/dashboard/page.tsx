'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function DashboardPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      if (profileError || !profileData) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      if (profileData.role === 'admin') {
        router.push('/admin/projects')
        return
      }

      setProfile(profileData)

      const { data: projectData } = await supabase
        .from('project')
        .select('*')
        .eq('uploaded_by', userData.user.id)
        .order('tgl_upload', { ascending: false })

      setProjects(projectData || [])
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Memuat dashboard...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Mahasiswa
              </h1>

              <p className="mt-2 text-gray-600">
                Halo, {profile?.nama}. Di sini kamu bisa mengelola project yang kamu upload.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link
                    href="/"
                    className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                    Home
                </Link>

                <Link
                    href="/upload"
                    className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                    Upload Project
                </Link>

                <button
                    onClick={handleLogout}
                    className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                    Logout
                </button>
                </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Project Saya
          </h2>

          <div className="mt-4 grid gap-4">
            {projects.length === 0 ? (
              <div className="rounded-xl bg-white p-6 text-gray-600 shadow-sm">
                Kamu belum mengupload project.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id_project}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.judul_project}
                      </h3>

                      <p className="mt-2 text-sm text-gray-600">
                        {project.deskripsi || 'Tidak ada deskripsi.'}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                          Tahun {project.tahun}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                          {project.jenis_project}
                        </span>

                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/project/${project.id_project}`}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
