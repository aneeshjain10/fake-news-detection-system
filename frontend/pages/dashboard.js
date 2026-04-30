import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getSession } from '../utils/auth'
import Navbar from '../components/Navbar'
import TextAnalysis from '../components/TextAnalysis'
import ImageAnalysis from '../components/ImageAnalysis'
import VideoAnalysis from '../components/VideoAnalysis'
import HistorySidebar from '../components/HistorySidebar'

const TABS = [
  { id: 'text', label: 'Text Analysis', icon: '📝', desc: 'Heuristic + ML' },
  { id: 'image', label: 'Image', icon: '🖼️', desc: 'Prototype' },
  { id: 'video', label: 'Video', icon: '🎬', desc: 'Prototype' },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('text')
  const [backendOnline, setBackendOnline] = useState(false)
  const [histKey, setHistKey] = useState(0)

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/'); return }
    setUser(session)
    // Health check
    fetch('http://localhost:5000/api/health')
      .then(r => r.json())
      .then(d => setBackendOnline(d.status === 'ok'))
      .catch(() => setBackendOnline(false))
  }, [])

  if (!user) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen grid-bg">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-text">
            Detection <span className="text-accent">Dashboard</span>
          </h1>
          <p className="text-text-dim text-sm mt-1">
            AI-Powered Cross-Media Fake News & Deepfake Detection System
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Detection Method', value: 'Hybrid AI', icon: '🧬' },
            { label: 'Heuristic Rules', value: '6 signals', icon: '🔍' },
            { label: 'ML Algorithm', value: 'TF-IDF + LR', icon: '🤖' },
            { label: 'Languages', value: 'EN + HI', icon: '🌐' },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-4 flex items-center gap-3 animate-slide-up"
              style={{ background: '#111827', border: '1px solid #1e2d45', animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}>
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-xs text-text-dim">{s.label}</div>
                <div className="font-mono font-semibold text-sm text-text">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main panel */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-5 flex-wrap">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === t.id
                      ? 'text-bg'
                      : 'text-text-dim hover:text-text'
                  }`}
                  style={{
                    background: tab === t.id ? 'linear-gradient(135deg, #00d4ff, #0099bb)' : '#111827',
                    border: `1px solid ${tab === t.id ? '#00d4ff' : '#1e2d45'}`,
                    boxShadow: tab === t.id ? '0 0 16px rgba(0,212,255,0.25)' : 'none'
                  }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                    tab === t.id ? 'bg-bg/20 text-bg' : 'text-text-dim'
                  }`} style={{ background: tab === t.id ? 'rgba(0,0,0,0.2)' : '#1a2235' }}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'text' && <TextAnalysis backendOnline={backendOnline} onAnalyzed={() => setHistKey(k => k+1)} />}
            {tab === 'image' && <ImageAnalysis />}
            {tab === 'video' && <VideoAnalysis />}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* System info */}
            <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
              <h4 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
                <span>⚙️</span> System Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">Heuristic Engine</span>
                  <span className="tag text-xs" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                    ● Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">ML Backend (Flask)</span>
                  <span className={`tag text-xs`} style={{
                    background: backendOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: backendOnline ? '#10b981' : '#ef4444',
                    border: `1px solid ${backendOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                  }}>
                    {backendOnline ? '● Online' : '○ Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-dim">Hindi Detection</span>
                  <span className="tag text-xs" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                    ● Active
                  </span>
                </div>
              </div>
              {!backendOnline && (
                <div className="mt-4 p-3 rounded-lg text-xs text-text-dim"
                  style={{ background: '#0a0e1a', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <p className="text-danger font-mono mb-1">Backend offline</p>
                  <p>Run: <code className="text-accent">cd backend && python app.py</code></p>
                </div>
              )}
            </div>

            {/* Architecture note */}
            <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
              <h4 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <span>🏗️</span> Architecture
              </h4>
              <div className="space-y-2 text-xs text-text-dim font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-accent">→</span> Next.js Frontend
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">→</span> Tailwind CSS UI
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">→</span> Flask ML API
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">→</span> TF-IDF from scratch
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent">→</span> localStorage (no DB)
                </div>
              </div>
            </div>

            <HistorySidebar refreshKey={histKey} />
          </div>
        </div>
      </div>
    </div>
  )
}
