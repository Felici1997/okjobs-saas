'use client';

type SessionScore = { label: string; score: number | null };

export default function ScoreChart({ data }: { data: SessionScore[] }) {
  if (data.length === 0) return null;

  const maxScore = 100;
  const width = 800;
  const height = 200;
  const padding = 40;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.score || 0) / maxScore) * chartHeight;
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto min-w-[600px]"
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding + chartHeight - (v / maxScore) * chartHeight;
          return (
            <g key={v}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="currentColor" className="text-base-content/10" strokeWidth="1" />
              <text x={padding - 5} y={y + 4} textAnchor="end" className="text-[10px] fill-base-content/40">{v}%</text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaPath} fill="url(#areaGradient)" fillOpacity="0.2" />
        
        {/* Line */}
        <path d={linePath} fill="none" stroke="currentColor" className="text-brand-blue" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="currentColor" className="text-brand-blue" strokeWidth="2" />
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text 
            key={i} 
            x={padding + (i / (data.length - 1)) * chartWidth} 
            y={height - 10} 
            textAnchor="middle" 
            className="text-[10px] fill-base-content/40"
          >
            {d.label}
          </text>
        ))}

        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" className="text-brand-blue" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
