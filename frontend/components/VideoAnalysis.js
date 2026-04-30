import { useState, useRef } from 'react'

export default function VideoAnalysis() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('video/')) return
    setFile(f)
    setResult(null)
    setProgress(0)
  }

  const analyze = async () => {
    setLoading(true)
    setProgress(0)
    // Simulate progress
    for (let p of [15, 30, 55, 70, 85, 95]) {
      await new Promise(r => setTimeout(r, 300))
      setProgress(p)
    }
    try {
      const form = new FormData()
      form.append('video', file)
      const res = await fetch('http://localhost:5000/api/analyze/video', { method: 'POST', body: form })
      const data = await res.json()
      setProgress(100)
      setResult(data)
    } catch {
      setProgress(100)
      setResult({
        verdict: "LIKELY AUTHENTIC",
        confidence: 0.68,
        frame_analysis: { frames_sampled: 30, suspicious_frames: 2, avg_anomaly_score: 0.18 },
        checks: [
          { name: "Temporal consistency", result: "Consistent" },
          { name: "Lip-sync accuracy", result: "Normal" },
          { name: "Eye blink pattern", result: "Natural" },
          { name: "Audio-visual sync", result: "Synced" },
        ],
        note: "Prototype: Mock analysis (backend offline)."
      })
    }
    setLoading(false)
  }

  const isFake = result?.verdict?.includes('DEEPFAKE')

  return (
    <div className="space-y-6">
      <div className="rounded-xl px-5 py-3 flex items-center gap-3"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <span className="text-warning text-lg">⚗️</span>
        <div>
          <p className="text-sm text-warning font-medium">Prototype Module</p>
          <p className="text-xs text-text-dim">Video deepfake detection uses frame sampling. Current results are simulated.</p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
        <h3 className="font-display font-semibold mb-4">Video Upload</h3>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          className="rounded-xl p-8 text-center cursor-pointer transition-all"
          style={{ border: '2px dashed #1e2d45' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#00d4ff44'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d45'}>
          <div className="text-4xl mb-3">🎬</div>
          {file ? (
            <p className="text-text font-medium">{file.name}</p>
          ) : (
            <>
              <p className="text-text-dim text-sm">Drag & drop a video, or <span className="text-accent">click to browse</span></p>
              <p className="text-xs text-text-dim mt-1">MP4, MOV, WEBM supported</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="video/*" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {file && (
          <div className="mt-4 space-y-3">
            {loading && (
              <div>
                <div className="flex justify-between text-xs font-mono text-text-dim mb-1.5">
                  <span>Analyzing frames...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#1e2d45' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00d4ff, #0099bb)' }} />
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={analyze} disabled={loading}
                className="btn-primary px-5 py-2 rounded-xl text-sm">
                {loading ? 'Analyzing...' : 'Analyze Video →'}
              </button>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="animate-slide-up space-y-4">
          <div className={`rounded-2xl p-6 ${isFake ? 'glow-danger' : 'glow-success'}`}
            style={{ background: '#111827', border: '1px solid #1e2d45' }}>
            <div className="flex items-center justify-between mb-5">
              <span className={`tag text-sm ${isFake ? 'verdict-fake' : 'verdict-real'}`} style={{ padding: '6px 14px', fontSize: '14px' }}>
                {result.verdict}
              </span>
              <span className="font-mono text-sm text-text-dim">
                Confidence: <span className="text-text font-bold">{(result.confidence * 100).toFixed(0)}%</span>
              </span>
            </div>

            {/* Frame stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Frames Sampled', value: result.frame_analysis.frames_sampled },
                { label: 'Suspicious Frames', value: result.frame_analysis.suspicious_frames },
                { label: 'Avg Anomaly', value: (result.frame_analysis.avg_anomaly_score * 100).toFixed(0) + '%' },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl p-3 text-center"
                  style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
                  <div className="font-mono font-bold text-lg text-text">{stat.value}</div>
                  <div className="text-xs text-text-dim mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
                  <span className="text-base mt-0.5">
                    {['Consistent', 'Normal', 'Natural', 'Synced'].includes(c.result) ? '✅' : '⚠️'}
                  </span>
                  <div>
                    <div className="text-xs font-mono text-text-dim">{c.name}</div>
                    <div className="text-sm text-text font-medium mt-0.5">{c.result}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-text-dim mt-4 italic">{result.note}</p>
          </div>
        </div>
      )}
    </div>
  )
}
