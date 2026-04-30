import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { login, signup, getSession } from '../utils/auth'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getSession()) router.replace('/dashboard')
  }, [])

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))

    const result = mode === 'login'
      ? login(form.email, form.password)
      : signup(form.name, form.email, form.password)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-accent"
              style={{ background: 'linear-gradient(135deg, #00d4ff22, #00d4ff11)', border: '1px solid #00d4ff44' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-text">FakeGuard <span className="text-accent">AI</span></span>
          </div>
          <p className="text-text-dim text-sm">AI-Powered Fake News & Deepfake Detection</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 scan-overlay"
          style={{ background: '#111827', border: '1px solid #1e2d45' }}>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ background: '#0a0e1a' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  mode === m
                    ? 'bg-accent text-bg font-semibold'
                    : 'text-text-dim hover:text-text'
                }`}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {mode === 'signup' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-mono text-text-dim mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="cyber-input w-full rounded-lg px-4 py-3 text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-text-dim mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="cyber-input w-full rounded-lg px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-text-dim mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="cyber-input w-full rounded-lg px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-danger"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 p-4 rounded-lg text-xs text-text-dim"
              style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
              <p className="font-mono mb-1 text-accent">Demo credentials</p>
              <p>Email: <span className="text-text">demo@test.com</span></p>
              <p>Password: <span className="text-text">demo123</span></p>
              <p className="mt-1 opacity-60">Or sign up to create your account</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
