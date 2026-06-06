'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function RegisterPage() {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama,
        },
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Akun berhasil dibuat. Silakan cek email jika verifikasi aktif, lalu login.')
    }

    setLoading(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Nama lengkap"
            required
            className="w-full rounded-lg border px-4 py-2"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border px-4 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password minimal 6 karakter"
            required
            className="w-full rounded-lg border px-4 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2 text-white"
          >
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}

        <Link href="/login" className="mt-4 inline-block text-sm text-gray-600 hover:text-black">
          Sudah punya akun? Login
        </Link>
      </div>
    </main>
  )
}