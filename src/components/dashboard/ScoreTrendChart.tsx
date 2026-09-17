import React from 'react';
import type { GolfScore } from '../../types';

interface ScoreTrendChartProps {
  scores: GolfScore[];
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ scores }) => {
  if (scores.length < 2) {
    return null;
  }

  // PRD stores newest first; for trend line, reverse so time moves left to right
  const chronologicalScores = [...scores].reverse();

  const minScore = Math.min(...chronologicalScores.map((s) => s.score));
  const maxScore = Math.max(...chronologicalScores.map((s) => s.score));
  const avgScore = (
    chronologicalScores.reduce((acc, curr) => acc + curr.score, 0) / chronologicalScores.length
  ).toFixed(1);

  // SVG Chart Dimensions
  const width = 500;
  const height = 160;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const yMin = Math.max(1, minScore - 2);
  const yMax = Math.min(45, maxScore + 2);

  const getX = (index: number) => {
    if (chronologicalScores.length === 1) return width / 2;
    return paddingX + (index * (width - paddingX * 2)) / (chronologicalScores.length - 1);
  };

  const getY = (score: number) => {
    const effectiveRange = yMax - yMin || 1;
    const ratio = (score - yMin) / effectiveRange;
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  // Build SVG Path
  const points = chronologicalScores.map((s, i) => ({
    x: getX(i),
    y: getY(s.score),
    score: s.score,
    date: s.date,
  }));

  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    // Bezier curve smoothing
    const prev = points[index - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  // Gradient Area Path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const avgY = getY(parseFloat(avgScore));

  return (
    <div className="w-full bg-sand-50/70 border border-sand-200/90 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-charcoal-light">
            GOLF PERFORMANCE TREND
          </span>
          <span className="text-[10px] font-mono text-sage-800 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
            Last {chronologicalScores.length} Rounds
          </span>
        </div>
        <span className="text-[11px] font-mono text-charcoal-muted">
          Avg: <strong className="text-charcoal">{avgScore} pts</strong>
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#264e36" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#264e36" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Average Reference Line */}
          <line
            x1={paddingX}
            y1={avgY}
            x2={width - paddingX}
            y2={avgY}
            stroke="#b5c4b1"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={width - paddingX + 6}
            y={avgY + 3}
            fill="#6d7f6b"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
          >
            avg
          </text>

          {/* Area Fill */}
          <path d={areaD} fill="url(#scoreTrendGradient)" />

          {/* Main Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#264e36"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points and Value Badges */}
          {points.map((pt, i) => (
            <g key={i} className="transition-transform duration-200">
              {/* Outer ring */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="#ffffff"
                stroke="#264e36"
                strokeWidth="2.5"
              />
              {/* Center dot */}
              <circle cx={pt.x} cy={pt.y} r="2" fill="#d4af37" />

              {/* Score Value Tag above point */}
              <text
                x={pt.x}
                y={pt.y - 9}
                textAnchor="middle"
                fill="#1c2826"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {pt.score}
              </text>

              {/* Date label on X axis */}
              <text
                x={pt.x}
                y={height - 12}
                textAnchor="middle"
                fill="#707973"
                fontSize="9"
                fontFamily="monospace"
              >
                {pt.date.slice(5)} {/* MM-DD */}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-charcoal-light pt-2 border-t border-sand-200/60 mt-1">
        <span>Chronological progression (oldest → newest)</span>
        <span className="font-mono">Stableford scale (1–45)</span>
      </div>
    </div>
  );
};
