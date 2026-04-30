const SIGNAL_ICONS = {
  EXCESSIVE_CAPS: '🔤',
  MODERATE_CAPS: '🔡',
  EXCESSIVE_EXCLAMATION: '❗',
  MULTIPLE_EXCLAMATION: '❕',
  CLICKBAIT_PHRASES: '🎣',
  FAKE_KEYWORDS: '🚩',
  NO_SOURCE: '📵',
  URGENCY_LANGUAGE: '⚡',
}

export default function SignalCard({ signal, index }) {
  const icon = SIGNAL_ICONS[signal.type] || '⚠️'
  const isHigh = signal.weight >= 20
  const isMed = signal.weight >= 10

  return (
    <div className="rounded-xl p-4 animate-slide-up"
      style={{
        background: '#1a2235',
        border: `1px solid ${isHigh ? 'rgba(239,68,68,0.3)' : isMed ? 'rgba(245,158,11,0.25)' : '#1e2d45'}`,
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'both'
      }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">{icon}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-medium"
                style={{ color: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#8899aa' }}>
                {signal.type.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-text-dim leading-relaxed">{signal.detail}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-mono text-sm font-bold"
            style={{ color: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#8899aa' }}>
            +{signal.weight}
          </span>
          <div className="text-xs text-text-dim">pts</div>
        </div>
      </div>
    </div>
  )
}
