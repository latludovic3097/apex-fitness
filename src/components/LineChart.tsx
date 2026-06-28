// Mini courbe SVG sans dépendance (port de svgLine de state.js).
// Trace une ligne avec points + tooltips natifs.

interface Point {
  label: string
  value: number
}

export function LineChart({
  data,
  color = "#10b981",
  width = 300,
  height = 120,
  unit = "kg",
}: {
  data: Point[]
  color?: string
  width?: number
  height?: number
  unit?: string
}) {
  if (data.length < 2) {
    return (
      <div className="py-4 text-center text-xs italic text-muted-foreground">
        Logge au moins 2 pesées pour voir la courbe.
      </div>
    )
  }
  const values = data.map((d) => d.value)
  const mx = Math.max(...values) || 1
  const mn = Math.min(...values)
  // marge basse de 0.2 kg pour ne pas coller les points au bord
  const lo = Math.max(0, mn - 0.5)
  const hi = mx + 0.5
  const range = hi - lo || 1
  const cH = height - 25
  const cW = width - 40
  const step = cW / (data.length - 1)

  let pts = ""
  const dots = data.map((d, i) => {
    const x = 30 + i * step
    const y = cH - ((d.value - lo) / range) * cH
    pts += (i ? " L" : "M") + `${x.toFixed(1)},${y.toFixed(1)}`
    return { x, y, ...d }
  })

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Courbe d'évolution du poids">
      <line x1="28" y1="0" x2="28" y2={cH} stroke="var(--bd)" />
      <line x1="28" y1={cH} x2={width} y2={cH} stroke="var(--bd)" />
      <text x="25" y="10" textAnchor="end" fontSize="9" fill="var(--mt)">
        {hi.toFixed(1)}
      </text>
      <text x="25" y={cH - 2} textAnchor="end" fontSize="9" fill="var(--mt)">
        {lo.toFixed(1)}
      </text>
      <path d={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r="3.5" fill={color}>
            <title>
              {d.label}: {d.value} {unit}
            </title>
          </circle>
          {data.length <= 10 && (
            <text x={d.x} y={cH + 12} textAnchor="middle" fontSize="9" fill="var(--mt)">
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
