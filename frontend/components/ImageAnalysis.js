import { useState, useRef } from 'react'

export default function ImageAnalysis() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const analyze = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    try {
      const form = new FormData()
      form.append('image', file)
      const res = await fetch('https://fake-news-detection-system-j6b1.onrender.com/api/analyze/image', { method: 'POST', body: form })
      const data = await res.json()
      setResult(data)
    } catch {
      // Mock fallback
      setResult({
        verdict: "LIKELY AUTHENTIC",
        confidence: 0.73,
        checks: [
          { name: "Facial landmark consistency", result: "Normal" },
          { name: "Compression artifact analysis", result: "Normal" },
          { name: "Metadata integrity", result: "Present" },
          { name: "GAN fingerprint scan", result: "Not detected" },
        ],
        note: "Prototype: Mock analysis (backend offline)."
      })
    }
    setLoading(false)
  }

  const isFake = result?.verdict?.includes('DEEPFAKE')

  return (
    <div className="space-y-6">
      {/* Prototype banner */}
      <div className="rounded-xl px-5 py-3 flex items-center gap-3"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
        <span className="text-warning text-lg">⚗️</span>
        <div>
          <p className="text-sm text-warning font-medium">Prototype Module</p>
          <p className="text-xs text-text-dim">Image deepfake detection is under development. Current results are simulated.</p>
        </div>
      </div>

      {/* Upload */}
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
        <h3 className="font-display font-semibold mb-4">Image Upload</h3>
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          className="rounded-xl p-8 text-center cursor-pointer transition-all"
          style={{ border: '2px dashed #1e2d45' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#00d4ff44'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d45'}>
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
          ) : (
            <div>
              <div className="text-4xl mb-3">🖼️</div>
              <p className="text-text-dim text-sm">Drag & drop an image, or <span className="text-accent">click to browse</span></p>
              <p className="text-xs text-text-dim mt-1">JPG, PNG, WEBP supported</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {file && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-text-dim font-mono">{file.name}</span>
            <button onClick={analyze} disabled={loading}
              className="btn-primary px-5 py-2 rounded-xl text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-bg border-t-transparent animate-spin" />
                  Scanning...
                </span>
              ) : 'Analyze Image →'}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="animate-slide-up space-y-4">
          <div className={`rounded-2xl p-6 ${isFake ? 'glow-danger' : 'glow-success'}`}
            style={{ background: '#111827', border: '1px solid #1e2d45' }}>
            <div className="flex items-center justify-between mb-4">
              <span className={`tag text-sm ${isFake ? 'verdict-fake' : 'verdict-real'}`} style={{ padding: '6px 14px', fontSize: '14px' }}>
                {result.verdict}
              </span>
              <span className="font-mono text-sm text-text-dim">
                Confidence: <span className="text-text font-bold">{(result.confidence * 100).toFixed(0)}%</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
                  <span className="text-base mt-0.5">{c.result === 'Normal' || c.result === 'Present' || c.result === 'Not detected' ? '✅' : '⚠️'}</span>
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
