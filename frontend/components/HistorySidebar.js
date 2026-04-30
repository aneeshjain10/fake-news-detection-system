import { useEffect, useState } from 'react'
import { getHistory } from '../utils/auth'

export default function HistorySidebar({ refreshKey }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    setHistory(getHistory().slice(0, 5))
  }, [refreshKey])

  if (history.length === 0) return (
    <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
      <h4 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
        <span>📋</span> Recent Analysis
      </h4>
      <p className="text-xs text-text-dim font-mono">No analyses yet. Run your first check!</p>
    </div>
  )

  return (
    <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid #1e2d45' }}>
      <h4 className="font-display font-semibold text-sm mb-4 flex items-center gap-2">
        <span>📋</span> Recent Analysis
        <span className="ml-auto text-xs font-mono text-text-dim">Last {history.length}</span>
      </h4>
      <div className="space-y-2">
        {history.map((h) => {
          const verdictColor =
            h.verdict === 'FAKE' ? '#ef4444' :
            h.verdict === 'SUSPICIOUS' ? '#f59e0b' : '#10b981'
          return (
            <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ background: '#0a0e1a', border: '1px solid #1e2d45' }}>
              <span className="text-base flex-shrink-0">
                {h.type === 'text' ? '📝' : h.type === 'image' ? '🖼️' : '🎬'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-dim truncate">{h.preview}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-mono font-semibold" style={{ color: verdictColor }}>
                    {h.verdict}
                  </span>
                  {h.score !== undefined && (
                    <span className="text-xs font-mono text-text-dim">· {h.score}pt</span>
                  )}
                </div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: verdictColor }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
