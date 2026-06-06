'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function UploadProjectPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [kategoriList, setKategoriList] = useState<any[]>([])
  const [mataKuliahList, setMataKuliahList] = useState<any[]>([])
  const [teknologiList, setTeknologiList] = useState<any[]>([])

  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [jenisProject, setJenisProject] = useState('mata_kuliah')
  const [idKategori, setIdKategori] = useState('')
  const [idMk, setIdMk] = useState('')
  const [selectedTeknologi, setSelectedTeknologi] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        router.push('/login')
        return
      }

      setUser(userData.user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      if (!profileData) {
        await supabase.auth.signOut()
        router.push('/login')
        return
      }

      setProfile(profileData)

      if (profileData.role === 'admin') {
        router.push('/admin/projects')
        return
      }

      const { data: kategoriData } = await supabase
        .from('kategori')
        .select('*')
        .order('nama_kategori', { ascending: true })

      const { data: mkData } = await supabase
        .from('mata_kuliah')
        .select('*')
        .order('nama_mk', { ascending: true })

      const { data: teknologiData } = await supabase
        .from('teknologi')
        .select('*')
        .order('nama_teknologi', { ascending: true })

      setKategoriList(kategoriData || [])
      setMataKuliahList(mkData || [])
      setTeknologiList(teknologiData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  function handleTeknologiChange(id: string) {
    if (selectedTeknologi.includes(id)) {
      setSelectedTeknologi(selectedTeknologi.filter((item) => item !== id))
    } else {
      setSelectedTeknologi([...selectedTeknologi, id])
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSubmitting(true)
    setMessage('')
    setMessageType('')

    if (!user) {
      setMessage('Kamu harus login terlebih dahulu.')
      setMessageType('error')
      setSubmitting(false)
      return
    }

    if (!judul || !deskripsi || !tahun || !jenisProject || !idKategori) {
      setMessage('Data project wajib diisi.')
      setMessageType('error')
      setSubmitting(false)
      return
    }

    if (jenisProject === 'mata_kuliah' && !idMk) {
      setMessage('Mata kuliah wajib dipilih untuk jenis project mata kuliah.')
      setMessageType('error')
      setSubmitting(false)
      return
    }

    if (!file) {
      setMessage('File project wajib diupload.')
      setMessageType('error')
      setSubmitting(false)
      return
    }

    const { data: projectData, error: projectError } = await supabase
      .from('project')
      .insert({
        judul_project: judul,
        deskripsi,
        tahun: Number(tahun),
        jenis_project: jenisProject,
        id_kategori: Number(idKategori),
        id_mk: jenisProject === 'mata_kuliah' ? Number(idMk) : null,
        uploaded_by: user.id,
        status: 'pending',
      })
      .select('id_project')
      .single()

    if (projectError || !projectData) {
      setMessage(`Gagal menyimpan project: ${projectError?.message}`)
      setMessageType('error')
      setSubmitting(false)
      return
    }

    const idProject = projectData.id_project

    const safeFileName = file.name.replace(/\s+/g, '-')
    const storagePath = `project-${idProject}/${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(storagePath, file)

    if (uploadError) {
      setMessage(`Project tersimpan, tapi file gagal diupload: ${uploadError.message}`)
      setMessageType('error')
      setSubmitting(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('project-files')
      .getPublicUrl(storagePath)

    const publicUrl = publicUrlData.publicUrl

    const { error: fileError } = await supabase
      .from('file_project')
      .insert({
        id_project: idProject,
        nama_file: file.name,
        jenis_file: file.type || 'unknown',
        ukuran_file: file.size,
        storage_path: storagePath,
        url: publicUrl,
      })

    if (fileError) {
      setMessage(`File berhasil diupload, tapi metadata gagal disimpan: ${fileError.message}`)
      setMessageType('error')
      setSubmitting(false)
      return
    }

    if (selectedTeknologi.length > 0) {
      const teknologiRows = selectedTeknologi.map((idTeknologi) => ({
        id_project: idProject,
        id_teknologi: Number(idTeknologi),
      }))

      const { error: teknologiError } = await supabase
        .from('project_teknologi')
        .insert(teknologiRows)

      if (teknologiError) {
        setMessage(`Project berhasil disimpan, tapi teknologi gagal disimpan: ${teknologiError.message}`)
        setMessageType('error')
        setSubmitting(false)
        return
      }
    }

    setMessage('Project berhasil diupload dan menunggu persetujuan admin.')
    setMessageType('success')
    setSubmitting(false)

    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Memuat halaman upload...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            ← Dashboard
          </Link>

          <Link
            href="/"
            className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Home
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Project
          </h1>

          <p className="mt-2 text-gray-600">
            Upload project mahasiswa. Project akan masuk dengan status pending dan menunggu persetujuan admin.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Judul Project
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                placeholder="Contoh: Repository Project Mahasiswa"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="mt-2 min-h-32 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                placeholder="Jelaskan ringkasan project..."
                required
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tahun
                </label>
                <input
                  type="number"
                  value={tahun}
                  onChange={(e) => setTahun(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Jenis Project
                </label>
                <select
                  value={jenisProject}
                  onChange={(e) => {
                    setJenisProject(e.target.value)
                    if (e.target.value !== 'mata_kuliah') {
                      setIdMk('')
                    }
                  }}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  required
                >
                  <option value="mata_kuliah">Mata Kuliah</option>
                  <option value="mandiri">Mandiri</option>
                  <option value="skripsi">Skripsi</option>
                  <option value="lomba">Lomba</option>
                  <option value="magang">Magang</option>
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <select
                  value={idKategori}
                  onChange={(e) => setIdKategori(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {kategoriList.map((kategori) => (
                    <option
                      key={kategori.id_kategori}
                      value={kategori.id_kategori}
                    >
                      {kategori.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              {jenisProject === 'mata_kuliah' && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mata Kuliah
                  </label>
                  <select
                    value={idMk}
                    onChange={(e) => setIdMk(e.target.value)}
                    className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    required
                  >
                    <option value="">Pilih mata kuliah</option>
                    {mataKuliahList.map((mk) => (
                      <option key={mk.id_mk} value={mk.id_mk}>
                        {mk.nama_mk}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Teknologi yang Digunakan
              </label>

              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {teknologiList.map((teknologi) => (
                  <label
                    key={teknologi.id_teknologi}
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeknologi.includes(
                        String(teknologi.id_teknologi)
                      )}
                      onChange={() =>
                        handleTeknologiChange(String(teknologi.id_teknologi))
                      }
                    />
                    {teknologi.nama_teknologi}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                File Project
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                required
              />

              <p className="mt-2 text-xs text-gray-500">
                File bisa berupa PDF, ZIP, DOCX, atau file lain sesuai kebutuhan project.
              </p>
            </div>

            {message && (
              <div
                className={`rounded-xl p-4 text-sm ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting ? 'Mengupload...' : 'Upload Project'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}