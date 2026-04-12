import React from 'react';
import { motion } from 'framer-motion';

/**
 * Multi-ring radar/sunburst chart inspired by MindHealthy CBT app.
 * Shows all assessment dimensions as colored arcs on concentric rings.
 * 
 * @param {Array} data - Array of { id, title, score, maxScore, color, icon }
 * @param {number} size - Chart diameter (default 260)
 */
export function RadarChart({ data = [], size = 260 }) {
  const center = size / 2;
  const ringCount = data.length || 1;
  const minRadius = size * 0.15;
  const maxRadius = size * 0.46;
  const ringGap = ringCount > 1 ? (maxRadius - minRadius) / (ringCount - 1) : 0;
  const ringWidth = Math.min(18, (maxRadius - minRadius) / Math.max(ringCount, 1) - 2);

  // Axis lines & icons at N, NE, E, SE, S, SW, W, NW positions
  const axisIcons = ['👤', '💙', '📚', '🧠', '🎯', '🌿', '⭐', '🔮'];
  const axisCount = 8;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-[48px] mb-3"
        >🧬</motion.div>
        <p className="text-white/30 text-[13px] font-medium mb-1">Your mental map is empty</p>
        <p className="text-white/20 text-[11px]">Complete assessments to build your psychological portrait</p>
      </div>
    );
  }

  // Build arc data
  const arcs = data.map((item, i) => {
    const radius = minRadius + (i * ringGap);
    const percentage = Math.min((item.score / item.maxScore) * 100, 100);
    const circumference = 2 * Math.PI * radius;
    const arcLength = (percentage / 100) * circumference;
    const dashOffset = circumference - arcLength;

    return {
      ...item,
      radius,
      circumference,
      dashOffset,
      percentage,
      index: i,
    };
  });

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow */}
      <div className="absolute inset-0 rounded-full opacity-15 blur-[40px]"
        style={{ background: `radial-gradient(circle, ${data[0]?.color || '#7C6AF5'} 0%, transparent 70%)` }}
      />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
        {/* Grid circles */}
        {arcs.map((arc, i) => (
          <circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={arc.radius}
            fill="none"
            stroke="white"
            strokeOpacity="0.04"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {Array.from({ length: axisCount }).map((_, i) => {
          const angle = (i * 360 / axisCount) - 90;
          const rad = (angle * Math.PI) / 180;
          const x2 = center + Math.cos(rad) * (maxRadius + 6);
          const y2 = center + Math.sin(rad) * (maxRadius + 6);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="white"
              strokeOpacity="0.04"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
          );
        })}

        {/* Arc segments (colored rings) */}
        {arcs.map((arc, i) => (
          <g key={`arc-${i}`}>
            {/* Track */}
            <circle
              cx={center}
              cy={center}
              r={arc.radius}
              fill="none"
              stroke="white"
              strokeOpacity="0.06"
              strokeWidth={ringWidth}
              strokeLinecap="round"
            />
            {/* Glow */}
            <motion.circle
              cx={center}
              cy={center}
              r={arc.radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={ringWidth + 8}
              strokeLinecap="round"
              strokeDasharray={arc.circumference}
              opacity="0.08"
              transform={`rotate(-90 ${center} ${center})`}
              initial={{ strokeDashoffset: arc.circumference }}
              animate={{ strokeDashoffset: arc.dashOffset }}
              transition={{ duration: 1.5, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Active arc */}
            <motion.circle
              cx={center}
              cy={center}
              r={arc.radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={ringWidth}
              strokeLinecap="round"
              strokeDasharray={arc.circumference}
              transform={`rotate(-90 ${center} ${center})`}
              initial={{ strokeDashoffset: arc.circumference }}
              animate={{ strokeDashoffset: arc.dashOffset }}
              transition={{ duration: 1.5, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* End-cap dot */}
            <motion.circle
              cx={center + arc.radius * Math.cos(((arc.percentage / 100) * 360 - 90) * Math.PI / 180)}
              cy={center + arc.radius * Math.sin(((arc.percentage / 100) * 360 - 90) * Math.PI / 180)}
              r={ringWidth / 3}
              fill="white"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: 1.5 + i * 0.15 }}
            />
          </g>
        ))}

        {/* Center circle with overall score */}
        <circle
          cx={center}
          cy={center}
          r={minRadius - ringWidth - 4}
          fill="rgba(255,255,255,0.03)"
          stroke="white"
          strokeOpacity="0.06"
          strokeWidth="1"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <span className="text-[32px] font-black text-white leading-none tracking-tighter">
            {data.length}
          </span>
          <p className="text-[8px] font-black text-white/25 uppercase tracking-[0.3em] mt-1">Tests Done</p>
        </motion.div>
      </div>

      {/* Axis icons */}
      {data.slice(0, axisCount).map((item, i) => {
        const angle = (i * 360 / Math.min(data.length, axisCount)) - 90;
        const rad = (angle * Math.PI) / 180;
        const iconRadius = maxRadius + 24;
        const x = center + Math.cos(rad) * iconRadius;
        const y = center + Math.sin(rad) * iconRadius;
        return (
          <motion.div
            key={`icon-${i}`}
            className="absolute z-20 flex items-center justify-center"
            style={{
              left: x - 14,
              top: y - 14,
              width: 28,
              height: 28,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.1, type: 'spring', stiffness: 200 }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] border"
              style={{
                backgroundColor: `${item.color}20`,
                borderColor: `${item.color}30`,
              }}
            >
              {item.icon || axisIcons[i % axisIcons.length]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Legend for the radar chart ──────────────────────────── */
export function RadarLegend({ data = [] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
      {data.map((item, i) => (
        <motion.div
          key={item.id}
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.06 }}
        >
          <div
            className="w-2 h-2 rounded-full shadow-sm"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[10px] font-bold text-white/40 tracking-wide">{item.title}</span>
          <span className="text-[10px] font-black tracking-tight" style={{ color: item.color }}>
            {Math.round((item.score / item.maxScore) * 100)}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}
