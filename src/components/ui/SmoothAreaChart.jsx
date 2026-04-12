import React, { useState, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to calculate control points for smooth bezier curve
const controlPoint = (current, previous, next, reverse) => {
  const p = previous || current;
  const n = next || current;
  const smoothing = 0.2;
  const o = {
    x: n.x - p.x,
    y: n.y - p.y
  };
  const angle = Math.atan2(o.y, o.x);
  const length = Math.sqrt(o.x * o.x + o.y * o.y) * smoothing;
  const x = current.x + Math.cos(angle + (reverse ? Math.PI : 0)) * length;
  const y = current.y + Math.sin(angle + (reverse ? Math.PI : 0)) * length;
  return { x, y };
};

const bezierCommand = (point, i, a) => {
  const cps = controlPoint(a[i - 1], a[i - 2], point, false);
  const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
  return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
};

const createSmoothPath = (points) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  const d = points.reduce((acc, point, i, a) => i === 0 ? `M ${point.x},${point.y}` : `${acc} ${bezierCommand(point, i, a)}`, '');
  return d;
};

export const SmoothAreaChart = ({
  data = [], 
  height = 220, 
  color = '#7C6AF5',
  maxScore = 30
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height || height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  const { width } = dimensions;

  if (data.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-white/30 text-center px-6 py-10">
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-[48px] mb-3 block"
        >🌿</motion.span>
        <p className="text-[14px] font-bold text-white/30 mb-1">No data yet</p>
        <p className="text-[12px] text-white/20">Complete your first assessment to see your progress chart</p>
      </div>
    );
  }

  // Pre-calculate positions based on current width
  const paddingX = 30;
  const paddingYTop = 45;
  const paddingYBottom = 20;
  
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingYTop - paddingYBottom;

  let points = [];
  if (data.length === 1) {
    const yRatio = data[0].score / maxScore;
    const yPos = paddingYTop + innerHeight - (yRatio * innerHeight);
    const xPos = width / 2;
    points = [
      { x: paddingX, y: yPos, original: data[0] },
      { x: xPos, y: yPos, original: data[0] },
      { x: width - paddingX, y: yPos, original: data[0] }
    ];
  } else {
    points = data.map((d, i) => {
      const xRatio = i / (data.length - 1);
      const yRatio = d.score / maxScore;
      return {
        x: paddingX + (xRatio * innerWidth),
        y: paddingYTop + innerHeight - (yRatio * innerHeight),
        original: d
      };
    });
  }

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x},${paddingYTop + innerHeight} L ${points[0].x},${paddingYTop + innerHeight} Z`
    : '';

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-[24px]" style={{ height }}>
      {/* Background gradient glow */}
      <div 
        className="absolute inset-x-0 top-0 h-1/2 blur-[100px] opacity-15 pointer-events-none"
        style={{ backgroundColor: color }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Tooltip */}
      <AnimatePresence>
        {hoveredIndex !== null && points[hoveredIndex] && (
          <motion.div 
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-[130%]"
            style={{ 
              left: points[hoveredIndex].x, 
              top: points[hoveredIndex].y 
            }}
          >
            <div className="bg-[#1C1C20] border border-white/15 px-4 py-2.5 rounded-[14px] shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: points[hoveredIndex].original.color || color }} />
                <p className="text-white text-[14px] font-black tracking-tight whitespace-nowrap">
                  {points[hoveredIndex].original.score}
                </p>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">pts</span>
              </div>
              <p className="text-white/50 text-[10px] font-bold mt-1 tracking-wide">
                {points[hoveredIndex].original.label}
              </p>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-0.5">
                {new Date(points[hoveredIndex].original.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1C1C20] rotate-45 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <svg width="100%" height="100%" viewBox={`0 0 ${width || 300} ${height}`} preserveAspectRatio="none" className="overflow-visible relative z-10">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="60%" stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Subtle grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
          <g key={i}>
            <line 
              x1={paddingX} 
              y1={paddingYTop + (r * innerHeight)} 
              x2={width - paddingX} 
              y2={paddingYTop + (r * innerHeight)} 
              stroke="white" 
              strokeOpacity="0.03" 
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            {/* Y-axis labels */}
            <text
              x={paddingX - 6}
              y={paddingYTop + (r * innerHeight) + 4}
              fill="white"
              fillOpacity="0.12"
              fontSize="9"
              fontWeight="700"
              textAnchor="end"
            >
              {Math.round(maxScore * (1 - r))}
            </text>
          </g>
        ))}

        {/* Soft glow behind the line */}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
            opacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        )}

        {/* Filled Area */}
        {areaPath && (
          <motion.path
            d={areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        )}

        {/* Main stroke Line — thin & elegant (2px) */}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        )}

        {/* Data Points */}
        {points.map((p, i) => {
          const isMiddle = data.length === 1 && i === 1;
          if (data.length === 1 && !isMiddle) return null;
          const isHovered = hoveredIndex === i;
          const isLast = (data.length > 1 && i === points.length - 1) || isMiddle;

          return (
            <g key={i}>
              {/* Outer pulse ring for latest */}
              {isLast && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r="16"
                  fill={p.original.color || color}
                  fillOpacity="0.08"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.08, 0.2, 0.08] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
                />
              )}
              {/* Colored ring */}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? "8" : isLast ? "7" : "5"}
                fill={p.original.color || color}
                fillOpacity={isHovered ? "0.3" : "0.2"}
                stroke={p.original.color || color}
                strokeWidth={isLast ? "2.5" : "2"}
                strokeOpacity="0.6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.8 + (i * 0.08) }}
              />
              {/* Inner white dot */}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isLast ? "3.5" : "2.5"}
                fill="white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.85 + (i * 0.08) }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Invisible touch targets */}
      <div className="absolute inset-0 flex">
        {points.map((p, i) => (
          (data.length === 1 && i !== 1) ? null :
          <div 
            key={i} 
            className="flex-1 h-full z-10"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchStart={() => setHoveredIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Score Gauge (radial ring) ───────────────────────────────────────── */
export const ScoreGauge = ({ score, maxScore, severity, color = '#7C6AF5' }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-[180px] h-[180px]">
      {/* Background glow */}
      <div
        className="absolute inset-0 rounded-full blur-[40px] opacity-20"
        style={{ backgroundColor: color }}
      />
      <svg width="180" height="180" viewBox="0 0 120 120" className="relative z-10 -rotate-90">
        {/* Track */}
        <circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke="white"
          strokeOpacity="0.06"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Active arc */}
        <motion.circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        {/* Glow layer */}
        <motion.circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          opacity="0.15"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.span
          className="text-[40px] font-black tracking-tighter leading-none"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-white/25 font-black uppercase tracking-[0.2em] mt-1">of {maxScore}</span>
      </div>
    </div>
  );
};

/* ─── Severity Bar ────────────────────────────────────────────────────── */
export const SeverityBar = ({ severity, color }) => {
  const levels = ['normal', 'mild', 'moderate', 'severe'];
  const levelColors = ['#34D399', '#FBBF24', '#FB923C', '#F87171'];
  const currentIndex = levels.indexOf(severity?.level || 'normal');

  return (
    <div className="w-full">
      <div className="flex gap-1.5 mb-3">
        {levels.map((l, i) => (
          <motion.div
            key={l}
            className="flex-1 h-[6px] rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: levelColors[i] }}
              initial={{ width: 0 }}
              animate={{ width: i <= currentIndex ? '100%' : '0%' }}
              transition={{ duration: 0.5, delay: 0.5 + (i * 0.1), ease: 'easeOut' }}
            />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between">
        {['Normal', 'Mild', 'Moderate', 'Severe'].map((label, i) => (
          <span
            key={label}
            className="text-[8px] font-black uppercase tracking-wider"
            style={{ color: i === currentIndex ? levelColors[i] : 'rgba(255,255,255,0.15)' }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ─── SmoothAreaChartLight — Premium Glassmorphism chart ─────── */
// Thin 1.5px line, Y-axis-only faint dashed grid, steep gradient fill
export const SmoothAreaChartLight = ({
  data = [],
  height = 200,
  color = '#6366F1',
  maxScore = 30
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height || height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  const { width } = dimensions;

  if (data.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center text-slate-400 text-center px-6 py-10"
        style={{ height }}
      >
        <span className="text-[36px] mb-3 block">📊</span>
        <p className="text-[14px] font-bold text-slate-500 mb-1">No data yet</p>
        <p className="text-[12px] text-slate-400">
          Complete your first assessment to see your progress chart
        </p>
      </div>
    );
  }

  const paddingX       = 16;
  const paddingYTop    = 24;
  const paddingYBottom = 16;
  const innerWidth     = width - paddingX * 2;
  const innerHeight    = height - paddingYTop - paddingYBottom;

  // Y-axis grid ratios (4 lines only)
  const yGridRatios = [0, 0.33, 0.67, 1];

  let points = [];
  if (data.length === 1) {
    const yRatio = data[0].score / maxScore;
    const yPos   = paddingYTop + innerHeight - yRatio * innerHeight;
    const xPos   = width / 2;
    points = [
      { x: paddingX,           y: yPos, original: data[0] },
      { x: xPos,               y: yPos, original: data[0] },
      { x: width - paddingX,   y: yPos, original: data[0] },
    ];
  } else {
    points = data.map((d, i) => {
      const xRatio = i / (data.length - 1);
      const yRatio = d.score / maxScore;
      return {
        x: paddingX + xRatio * innerWidth,
        y: paddingYTop + innerHeight - yRatio * innerHeight,
        original: d,
      };
    });
  }

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${paddingYTop + innerHeight} L ${points[0].x},${paddingYTop + innerHeight} Z`
    : '';

  const gradId  = `areaGradLight_${color.replace('#', '')}`;

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden" style={{ height }}>

      {/* ── Premium Tooltip ── */}
      <AnimatePresence>
        {hoveredIndex !== null && points[hoveredIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-[135%]"
            style={{ left: points[hoveredIndex].x, top: points[hoveredIndex].y }}
          >
            <div
              className="px-3.5 py-2 rounded-[12px]"
              style={{
                background: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex items-baseline gap-1">
                <span
                  className="text-[16px] font-black leading-none"
                  style={{ color }}
                >
                  {points[hoveredIndex].original.score}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">pts</span>
              </div>
              {points[hoveredIndex].original.label && (
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {points[hoveredIndex].original.label}
                </p>
              )}
            </div>
            {/* Arrow */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
              style={{ background: '#FFFFFF', boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width || 300} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible relative z-10"
      >
        <defs>
          {/* Steeper gradient — creates a clean lift effect */}
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.28" />
            <stop offset="55%"  stopColor={color} stopOpacity="0.08" />
            <stop offset="100%" stopColor={color} stopOpacity="0"   />
          </linearGradient>
        </defs>

        {/* ── Y-axis only: 4 faint dashed lines (NO vertical lines) ── */}
        {yGridRatios.map((r, i) => (
          <g key={`yg-${i}`}>
            <line
              x1={paddingX}
              y1={paddingYTop + r * innerHeight}
              x2={width - paddingX}
              y2={paddingYTop + r * innerHeight}
              stroke="#E2E8F0"        /* slate-200 — very faint */
              strokeWidth="1"
              strokeDasharray="3 6"   /* sparse dashes */
              strokeOpacity="0.8"
            />
          </g>
        ))}

        {/* ── Gradient fill area ── */}
        {areaPath && (
          <motion.path
            d={areaPath}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        )}

        {/* ── Main line — thin 1.5px, elegant ── */}
        {linePath && (
          <motion.path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {/* ── Data points — small, clean ── */}
        {points.map((p, i) => {
          const isMiddle = data.length === 1 && i === 1;
          if (data.length === 1 && !isMiddle) return null;
          const isLast = (data.length > 1 && i === points.length - 1) || isMiddle;
          return (
            <g key={i}>
              {/* Subtle pulse ring on latest point */}
              {isLast && (
                <motion.circle
                  cx={p.x} cy={p.y} r="8"
                  fill={color}
                  fillOpacity="0.10"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.10, 0.22, 0.10] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
                />
              )}
              {/* White-filled dot with colored ring */}
              <motion.circle
                cx={p.x} cy={p.y}
                r={isLast ? '4.5' : '3'}
                fill="white"
                stroke={color}
                strokeWidth={isLast ? '2' : '1.5'}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.5 + i * 0.06 }}
              />
            </g>
          );
        })}
      </svg>

      {/* Invisible touch/hover targets */}
      <div className="absolute inset-0 flex">
        {points.map((p, i) =>
          data.length === 1 && i !== 1 ? null : (
            <div
              key={i}
              className="flex-1 h-full z-10"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(i)}
            />
          )
        )}
      </div>
    </div>
  );
};
