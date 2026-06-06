'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setMessageType('')

    const cleanEmail = email.trim().toLowerCase()

    if (!cleanEmail || !password) {
      setMessage('Email dan password wajib diisi.')
      setMessageType('error')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error) {
      setMessage('Login gagal. Periksa email dan password kamu.')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (!data.user) {
      setMessage('Login gagal. User tidak ditemukan.')
      setMessageType('error')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, email, role')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setMessage('Akun berhasil login, tetapi profil tidak ditemukan di database.')
      setMessageType('error')
      setLoading(false)
      return
    }

    setMessage('Login berhasil. Mengalihkan halaman...')
    setMessageType('success')

    if (profile.role === 'admin') {
      router.push('/admin/projects')
    } else {
      router.push('/dashboard')
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <section className="hidden w-1/2 flex-col justify-between bg-black p-12 text-white lg:flex">
          <div>
            <div className="inline-flex rounded-full border border-white/20 px-4 py-2 text-sm">
              Repository Project Mahasiswa
            </div>

            <h1 className="mt-10 text-5xl font-bold leading-tight">
              Masuk dan kelola project mahasiswa dengan lebih rapi.
            </h1>

            <p className="mt-6 max-w-lg text-gray-300">
              Login sebagai mahasiswa untuk upload project, atau sebagai admin
              untuk memverifikasi dan mengelola repository project.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-bold">Public</p>
              <p className="mt-1 text-gray-300">Lihat dan download</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-bold">User</p>
              <p className="mt-1 text-gray-300">Upload project</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-2xl font-bold">Admin</p>
              <p className="mt-1 text-gray-300">Approval data</p>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center p-6 lg:w-1/2">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Login</h2>
              <p className="mt-2 text-sm text-gray-500">
                Masuk menggunakan akun yang sudah terdaftar.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="mt-2 flex rounded-xl border border-gray-200 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 text-sm text-gray-500 hover:text-black"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/forgot-password"
                  className="text-gray-500 hover:text-black"
                >
                  Lupa password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Memproses login...' : 'Masuk'}
              </button>
            </form>

            {message && (
              <div
                className={`mt-5 rounded-xl p-4 text-sm ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-black">
                Daftar sekarang
              </Link>
            </p>

            <div className="mt-6 border-t pt-5 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-black">
                Kembali ke halaman utama
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}