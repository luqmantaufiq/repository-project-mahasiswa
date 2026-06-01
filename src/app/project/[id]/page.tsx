import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

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

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: project, error } = await supabase
    .from('project')
    .select('*')
    .eq('id_project', Number(id))
    .single()

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-red-600">
            Project tidak ditemukan
          </h1>

          <p className="mt-2 text-gray-600">
            Data project tidak tersedia.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-white"
          >
            Kembali
          </Link>
        </section>
      </main>
    )
  }

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
        .select('nama_mk, kode_mk')
        .eq('id_mk', project.id_mk)
        .single()
    : { data: null }

  const { data: kelompok } = project.id_kelompok
    ? await supabase
        .from('kelompok')
        .select('nama_kelompok, kelas, semester, tahun_ajaran, jenis_kelompok')
        .eq('id_kelompok', project.id_kelompok)
        .single()
    : { data: null }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black">
          ← Kembali ke daftar project
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {kategori?.nama_kategori || 'Tanpa kategori'}
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {project.tahun}
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {formatJenisProject(project.jenis_project)}
            </span>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              {project.status}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            {project.judul_project}
          </h1>

          <p className="mt-4 whitespace-pre-line text-gray-700">
            {project.deskripsi || 'Tidak ada deskripsi.'}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900">
                Informasi Project
              </h2>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Kategori:</span>{' '}
                  {kategori?.nama_kategori || '-'}
                </p>

                <p>
                  <span className="font-medium">Mata Kuliah:</span>{' '}
                  {mataKuliah?.nama_mk || '-'}
                </p>

                <p>
                  <span className="font-medium">Jenis Project:</span>{' '}
                  {formatJenisProject(project.jenis_project)}
                </p>

                <p>
                  <span className="font-medium">Tahun:</span>{' '}
                  {project.tahun}
                </p>
              </div>
            </div>

            <div className="rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900">
                Informasi Kelompok
              </h2>

              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Nama Kelompok:</span>{' '}
                  {kelompok?.nama_kelompok || '-'}
                </p>

                <p>
                  <span className="font-medium">Jenis Kelompok:</span>{' '}
                  {kelompok?.jenis_kelompok || '-'}
                </p>

                <p>
                  <span className="font-medium">Kelas:</span>{' '}
                  {kelompok?.kelas || '-'}
                </p>

                <p>
                  <span className="font-medium">Tahun Ajaran:</span>{' '}
                  {kelompok?.tahun_ajaran || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}