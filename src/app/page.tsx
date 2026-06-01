import Link from 'next/link'
import { supabase } from './lib/supabaseClient'

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

function formatStatus(status: string) {
  const label: Record<string, string> = {
    pending: 'Pending',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
  }

  return label[status] || status
}

export default async function Home() {
  const { data: projects, error } = await supabase
    .from('project')
    .select('*')
    .eq('status', 'diterima')
    .order('tgl_upload', { ascending: false })

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-red-600">
            Error mengambil data
          </h1>
          <p className="mt-2 text-gray-700">{error.message}</p>
        </div>
      </main>
    )
  }

  const projectsWithDetails = await Promise.all(
    (projects || []).map(async (project) => {
      const { data: kategori } = project.id_kategori
        ? await supabase
            .from('kategori')
            .select('nama_kategori')
            .eq('id_kategori', project.id_kategori)
            .single()
        : { data: null }

      const { data: mataKuliah } = project.id_mk
        ? await supabase
            .from('mata_kuliah')
            .select('nama_mk')
            .eq('id_mk', project.id_mk)
            .single()
        : { data: null }

      return {
        ...project,
        kategori,
        mataKuliah,
      }
    })
  )

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Repository Project Mahasiswa
          </h1>

          <p className="mt-2 text-gray-600">
            Kumpulan project mahasiswa berdasarkan kategori, mata kuliah, tahun,
            dan teknologi yang digunakan.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projectsWithDetails.length === 0 ? (
            <div className="rounded-xl bg-white p-6 text-gray-500 shadow-sm">
              Belum ada project yang ditampilkan.
            </div>
          ) : (
            projectsWithDetails.map((project: any) => (
              <Link
                href={`/project/${project.id_project}`}
                key={project.id_project}
                className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {project.kategori?.nama_kategori || 'Tanpa kategori'}
                  </span>

                  <span className="text-sm text-gray-500">
                    {project.tahun}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900">
                  {project.judul_project}
                </h2>

                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {project.deskripsi || 'Tidak ada deskripsi.'}
                </p>

                <div className="mt-4 space-y-1 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Mata Kuliah:</span>{' '}
                    {project.mataKuliah?.nama_mk || '-'}
                  </p>

                  <p>
                    <span className="font-medium">Jenis:</span>{' '}
                    {formatJenisProject(project.jenis_project)}
                  </p>

                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {formatStatus(project.status)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  )
}