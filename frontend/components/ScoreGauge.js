export default function ScoreGauge({ score, label }) {
  const color = score >= 65 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981'
  const angle = (score / 100) * 180 - 90 // -90 to +90 degrees

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-16 overflow-hidden">
        {/* Track */}
        <svg width="128" height="64" viewBox="0 0 128 64">
          <path d="M 8 64 A 56 56 0 0 1 120 64" fill="none" stroke="#1e2d45" strokeWidth="10" strokeLinecap="round"/>
          <path d="M 8 64 A 56 56 0 0 1 120 64" fill="none" stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 175.9} 175.9`}
            style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}/>
        </svg>
        {/* Needle */}
        <div className="absolute bottom-0 left-1/2 origin-bottom -translate-x-1/2"
          style={{
            width: '2px', height: '44px', background: color,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: 'bottom center',
            transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            borderRadius: '1px',
            boxShadow: `0 0 8px ${color}`
          }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}`, marginBottom: '-6px' }} />
      </div>
      <div className="text-center">
        <div className="text-2xl font-display font-bold" style={{ color }}>{score}</div>
        <div className="text-xs font-mono text-text-dim uppercase tracking-wider">{label}</div>
      </div>
    </div>
  )
}
