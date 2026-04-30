import { useRouter } from 'next/router'
import { clearSession } from '../utils/auth'

export default function Navbar({ user }) {
  const router = useRouter()

  const logout = () => {
    clearSession()
    router.push('/')
  }

  return (
    <nav style={{ background: '#111827', borderBottom: '1px solid #1e2d45' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <span className="font-display font-bold text-text">FakeGuard <span className="text-accent">AI</span></span>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden sm:block text-sm text-text-dim">
              <span className="text-text font-medium">{user.name}</span>
            </span>
          )}
          <button onClick={logout}
            className="text-xs font-mono text-text-dim hover:text-danger transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid #1e2d45' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
