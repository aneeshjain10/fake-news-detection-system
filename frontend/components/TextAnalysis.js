import { useState } from 'react'
import ScoreGauge from './ScoreGauge'
import SignalCard from './SignalCard'
import { addToHistory } from '../utils/auth'

const SAMPLE_TEXTS = {
  fake: `BREAKING: Scientists SHOCKED by miracle cure that doctors DON'T want you to know!!! This banned remedy destroys cancer in 24 hours but Big Pharma is HIDING it from the public. SHARE NOW before this gets deleted! The deep state is suppressing the truth!!!`,
  real: `Researchers at Stanford University published a peer-reviewed study in the Journal of Medical Science showing that regular moderate exercise for 30 minutes daily is associated with a 25% reduction in cardiovascular disease risk. The study followed 5,000 participants over 10 years.`,
  hindi: `सनसनीखेज खुलासा! सरकार छुपा रही है ये बड़ा सच! अभी शेयर करें वरना यह पोस्ट हटा दी जाएगी। मीडिया नहीं बताएगा यह खबर। जागो भारत!`
}

const RISK_COLORS = {
  HIGH: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: '#ef4444' },
  MEDIUM: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b' },
  LOW: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#10b981' },
}

const VERDICT_COLORS = {
  FAKE: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', text: '#ef4444' },
  SUSPICIOUS: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', text: '#f59e0b' },
  'LIKELY REAL': { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', text: '#10b981' },
}

export default function TextAnalysis({ backendOnline, onAnalyzed }) {
  const [mode, setMode] = useState('text') // 'text' | 'url'
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    setError('')
    setLoading(true)
    setResult(null)

    try {
      let endpoint, body

      if (mode === 'url') {
        if (!url.trim()) { setError('Please enter a URL.'); setLoading(false); return }
        endpoint = 'http://localhost:5000/api/analyze/url'
        body = { url: url.trim() }
      } else {
        if (!text.trim() || text.trim().length < 10) {
          setError('Please enter at least 10 characters.')
          setLoading(false)
          return
        }
        endpoint = 'http://localhost:5000/api/analyze/text'
        body = { text: text.trim() }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Backend error')
      }

      const data = await res.json()
      setResult(data)
      addToHistory({
        type: 'text',
        verdict: data.final_verdict,
        score: data.combined_score,
        preview: mode === 'url' ? url : text.slice(0, 60)
      })
      if (onAnalyzed) onAnalyzed()
    } catch (e) {
      setError(e.message || 'Could not reach Flask backend. Make sure it is running on port 5000.')
    }
    setLoading(false)
  }

  const vc = result ? VERDICT_COLORS[result.final_verdict] || VERDICT_COLORS['LIKELY REAL'] : null
  const rc = result ? RISK_COLORS[result.sharing_risk] || RISK_COLORS.LOW : null

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-1">
        {[
          { id: 'text', label: '📝 Text / Article' },
          { id: 'url', label: '🔗 Analyze URL' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(null); setError('') }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: mode === m.id ? 'linear-gradient(135deg,#00d4ff,#0099bb)' : '#111827',
              color: mode === m.id ? '#0a0e1a' : '#8899aa',
              border: `1px solid ${mode === m.id ? '#00d4ff' : '#1e2d45'}`,
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-text">
            {mode === 'url' ? 'URL Input' : 'Text / Article Input'}
          </h3>
          {mode === 'text' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-dim font-mono">Sample:</span>
              {Object.keys(SAMPLE_TEXTS).map(k => (
                <button key={k} onClick={() => setText(SAMPLE_TEXTS[k])}
                  className="text-xs font-mono px-2 py-1 rounded transition-colors hover:text-accent"
                  style={{ border: '1px solid #1e2d45', color: '#8899aa', background: '#0a0e1a' }}>
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>

        {mode === 'text' ? (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste a news article, headline, social media post, or any text to analyze..."
            rows={6}
            className="cyber-input w-full rounded-xl px-4 py-3 text-sm resize-none leading-relaxed"
          />
        ) : (
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/news-article"
            className="cyber-input w-full rounded-xl px-4 py-3 text-sm"
          />
        )}

        {mode === 'url' && (
          <p className="text-xs text-text-dim mt-2 font-mono">
            ⓘ Fetches webpage text and sends it to the same analyzer. Works best on article pages.
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-1 rounded-full"
              style={{
                background: backendOnline ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: backendOnline ? '#10b981' : '#ef4444',
                border: `1px solid ${backendOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}>
              {backendOnline ? '● ML Backend: Online' : '○ ML Backend: Offline'}
            </span>
            {mode === 'text' && (
              <span className="text-xs text-text-dim font-mono">{text.length} chars</span>
            )}
          </div>
          <button onClick={analyze} disabled={loading || (!text.trim() && !url.trim())}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                {mode === 'url' ? 'Fetching & Analyzing...' : 'Analyzing...'}
              </span>
            ) : mode === 'url' ? 'Fetch & Analyze →' : 'Analyze →'}
          </button>
        </div>

        {error && (
          <div className="mt-3 px-4 py-3 rounded-lg text-sm text-danger"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">

          {/* Verdict header */}
          <div className="rounded-2xl p-6"
            style={{ background: '#111827', border: `1px solid ${vc.border}` }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <ScoreGauge score={result.combined_score} label="Risk Score" />
              <div className="flex-1">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="font-mono font-bold text-lg px-4 py-1 rounded-full"
                    style={{ background: vc.bg, color: vc.text, border: `1px solid ${vc.border}` }}>
                    {result.final_verdict === 'LIKELY REAL' ? '✅ LIKELY REAL' :
                     result.final_verdict === 'SUSPICIOUS' ? '⚠️ SUSPICIOUS' : '🚨 FAKE'}
                  </span>

                  {/* Language badge */}
                  <span className="tag text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }}>
                    {result.language === 'hi' ? '🇮🇳 Hindi' : '🇬🇧 English'}
                  </span>

                  {/* Content type */}
                  <span className="tag text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                    {result.content_icon} {result.content_type}
                  </span>

                  {/* Trusted source */}
                  {result.is_trusted_source && (
                    <span className="tag text-xs px-3 py-1 rounded-full font-semibold"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)' }}>
                      🏅 Trusted Source: {result.trusted_domain}
                    </span>
                  )}
                </div>

                {/* Confidence bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-text-dim font-mono mb-1">
                    <span>Confidence</span>
                    <span>{Math.round(result.confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ background: '#1e2d45' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${result.confidence * 100}%`,
                        background: vc.text
                      }} />
                  </div>
                </div>

                <p className="text-xs text-text-dim font-mono italic">
                  &quot;{result.text_preview}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Info cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Sharing Risk */}
            <div className="rounded-xl p-4" style={{ background: '#111827', border: `1px solid ${rc.border}` }}>
              <p className="text-xs text-text-dim font-mono mb-1">🔴 Sharing Risk</p>
              <p className="font-bold text-lg" style={{ color: rc.text }}>{result.sharing_risk}</p>
            </div>

            {/* Suggestion */}
            <div className="rounded-xl p-4 sm:col-span-2"
              style={{ background: '#111827', border: '1px solid #1e2d45' }}>
              <p className="text-xs text-text-dim font-mono mb-1">💡 Suggestion</p>
              <p className="text-sm text-text leading-snug">{result.suggestion}</p>
            </div>
          </div>

          {/* Why flagged */}
          {result.why_flagged && result.why_flagged.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
              <p className="text-xs text-text-dim font-mono mb-2">🔍 Why This Was Flagged</p>
              <ul className="space-y-1">
                {result.why_flagged.map((reason, i) => (
                  <li key={i} className="text-xs text-text flex items-start gap-2">
                    <span className="text-danger mt-0.5">›</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Dual analysis panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Heuristic */}
            <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🧠</span>
                <h4 className="font-display font-semibold text-sm">Heuristic Engine</h4>
                <span className="ml-auto tag" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }}>Rule-Based</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Score</span>
                  <span className="font-mono font-bold text-text">{result.heuristic.heuristic_score}/100</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#1e2d45' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${result.heuristic.heuristic_score}%`,
                      background: result.heuristic.heuristic_score >= 65 ? '#ef4444' : result.heuristic.heuristic_score >= 40 ? '#f59e0b' : '#10b981'
                    }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Verdict</span>
                  <span className="font-mono text-sm" style={{
                    color: result.heuristic.heuristic_verdict === 'FAKE' ? '#ef4444' :
                           result.heuristic.heuristic_verdict === 'SUSPICIOUS' ? '#f59e0b' : '#10b981'
                  }}>{result.heuristic.heuristic_verdict}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Risk Level</span>
                  <span className="font-mono text-sm text-text">{result.heuristic.risk_level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Language</span>
                  <span className="font-mono text-sm text-text">{result.heuristic.language === 'hi' ? 'Hindi 🇮🇳' : 'English 🇬🇧'}</span>
                </div>
              </div>
            </div>

            {/* ML */}
            <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🤖</span>
                <h4 className="font-display font-semibold text-sm">ML Model</h4>
                <span className="ml-auto tag" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>TF-IDF + LR</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Fake Probability</span>
                  <span className="font-mono font-bold text-text">{(result.ml.fake_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#1e2d45' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${result.ml.fake_probability * 100}%`,
                      background: result.ml.fake_probability >= 0.65 ? '#ef4444' : result.ml.fake_probability >= 0.4 ? '#f59e0b' : '#10b981'
                    }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">ML Verdict</span>
                  <span className="font-mono text-sm" style={{ color: result.ml.ml_verdict === 'FAKE' ? '#ef4444' : '#10b981' }}>{result.ml.ml_verdict}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Real Probability</span>
                  <span className="font-mono text-sm text-text">{(result.ml.real_probability * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-dim">Confidence</span>
                  <span className="font-mono text-sm text-text">{(result.ml.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signals */}
          {result.heuristic.signals.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
              <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                <span>🚦</span> Detected Signals
                <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded-full text-text-dim"
                  style={{ background: '#1a2235', border: '1px solid #1e2d45' }}>
                  {result.heuristic.signals.length} found
                </span>
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {result.heuristic.signals.map((s, i) => (
                  <SignalCard key={i} signal={s} index={i} />
                ))}
              </div>
            </div>
          )}

          {result.heuristic.signals.length === 0 && (
            <div className="rounded-2xl p-6 text-center" style={{ background: '#111827', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="text-3xl">✅</span>
              <p className="text-success font-medium mt-2">No suspicious signals detected</p>
              <p className="text-sm text-text-dim mt-1">This content appears to follow patterns of credible, factual reporting.</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-xl px-4 py-3 text-xs text-text-dim"
            style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
            ⚠️ <strong className="text-text">Disclaimer:</strong> This system uses heuristic + ML estimation, not factual verification.
            Results should not be treated as definitive truth. Always verify with primary sources.
          </div>
        </div>
      )}
    </div>
  )
}
