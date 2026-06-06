'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

function formatStatus(status: string) {
  const label: Record<string, string> = {
    pending: 'Pending',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
  }

  return label[status] || status
}

function formatJenisProject(jenis: string) {
  const label: Record<string, string> = {
    mata_kuliah: 'Mata Kuliah',
    mandiri: 'Mandiri',
    skripsi: 'Skripsi',
    lomba: 'Lomba',
    magang: 'Magang',
  }

  return label[jenis] || jenis
}

export default function AdminProjectsPage() {
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function checkAdminAndLoadProjects() {
    setLoading(true)

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

    if (profileData.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    setProfile(profileData)

    const { data: projectData, error: projectError } = await supabase
      .from('project')
      .select('*')
      .order('tgl_upload', { ascending: false })

    if (projectError) {
      setMessage(projectError.message)
      setProjects([])
    } else {
      setProjects(projectData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    checkAdminAndLoadProjects()
  }, [])

  async function updateStatus(id_project: number, status: string) {
    setMessage('')

    const { error } = await supabase
      .from('project')
      .update({ status })
      .eq('id_project', id_project)

    if (error) {
      setMessage(error.message)
      return
    }

    await checkAdminAndLoadProjects()
  }

  async function deleteProject(id_project: number) {
    const confirmDelete = confirm('Yakin ingin menghapus project ini?')

    if (!confirmDelete) return

    setMessage('')

    const { error } = await supabase
      .from('project')
      .delete()
      .eq('id_project', id_project)

    if (error) {
      setMessage(error.message)
      return
    }

    await checkAdminAndLoadProjects()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalProject = projects.length
  const totalPending = projects.filter((project) => project.status === 'pending').length
  const totalDiterima = projects.filter((project) => project.status === 'diterima').length
  const totalDitolak = projects.filter((project) => project.status === 'ditolak').length

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Memuat dashboard admin...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Admin
              </h1>

              <p className="mt-2 text-gray-600">
                Halo, {profile?.nama}. Di sini admin dapat mengelola persetujuan project mahasiswa.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Home
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

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Project</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalProject}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-3xl font-bold text-yellow-600">{totalPending}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Diterima</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{totalDiterima}</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Ditolak</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{totalDitolak}</p>
          </div>
        </div>

        {message && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Kelola Project Mahasiswa
          </h2>

          <div className="mt-6 space-y-4">
            {projects.length === 0 ? (
              <div className="rounded-xl border p-6 text-gray-600">
                Belum ada project.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id_project}
                  className="rounded-xl border p-5"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          ID: {project.id_project}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          {project.tahun}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          {formatJenisProject(project.jenis_project)}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            project.status === 'diterima'
                              ? 'bg-green-100 text-green-700'
                              : project.status === 'ditolak'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {formatStatus(project.status)}
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-semibold text-gray-900">
                        {project.judul_project}
                      </h3>

                      <p className="mt-2 max-w-3xl text-sm text-gray-600">
                        {project.deskripsi || 'Tidak ada deskripsi.'}
                      </p>

                      <Link
                        href={`/project/${project.id_project}`}
                        className="mt-4 inline-block text-sm font-medium text-black hover:underline"
                      >
                        Lihat detail project
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(project.id_project, 'diterima')}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                      >
                        Terima
                      </button>

                      <button
                        onClick={() => updateStatus(project.id_project, 'ditolak')}
                        className="rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
                      >
                        Tolak
                      </button>

                      <button
                        onClick={() => updateStatus(project.id_project, 'pending')}
                        className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Pending
                      </button>

                      <button
                        onClick={() => deleteProject(project.id_project)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
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