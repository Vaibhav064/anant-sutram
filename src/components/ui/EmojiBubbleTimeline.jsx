import React from 'react';
import { motion } from 'framer-motion';

/**
 * Emoji bubble timeline inspired by MindHealthy CBT app.
 * Shows mood entries as large colored emoji circles on a date axis.
 *
 * @param {Array} entries - Array of { score, emoji, createdAt, note }
 */

const MOOD_COLORS = {
  1: '#F87171', 2: '#F87171',
  3: '#FB923C', 4: '#FB923C',
  5: '#FBBF24', 6: '#FBBF24',
  7: '#34D399', 8: '#34D399',
  9: '#A899FF', 10: '#A899FF',
};

const MOOD_EMOJIS = {
  1: '😰', 2: '😰',
  3: '😔', 4: '😔',
  5: '😐', 6: '😐',
  7: '🙂', 8: '🙂',
  9: '🌟', 10: '🌟',
};

function getMoodColor(score) {
  return MOOD_COLORS[Math.min(10, Math.max(1, Math.round(score)))] || '#FBBF24';
}

function getMoodEmoji(entry) {
  if (entry.emoji) return entry.emoji;
  return MOOD_EMOJIS[Math.min(10, Math.max(1, Math.round(entry.score)))] || '😐';
}

function formatDay(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatWeekday(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function EmojiBubbleTimeline({ entries = [], maxVisible = 7 }) {
  // Get one entry per day (latest per day), sorted chronologically
  const dailyMap = {};
  entries.forEach(e => {
    const dayKey = new Date(e.createdAt).toDateString();
    if (!dailyMap[dayKey] || new Date(e.createdAt) > new Date(dailyMap[dayKey].createdAt)) {
      dailyMap[dayKey] = e;
    }
  });

  const dailyEntries = Object.values(dailyMap)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-maxVisible);

  if (dailyEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="text-[36px] mb-2"
        >🌤️</motion.div>
        <p className="text-muted text-[12px] font-medium">No mood entries yet</p>
        <p className="text-muted/60 text-[10px] mt-1">Check in daily to build your emotional timeline</p>
      </div>
    );
  }

  const chartHeight = 160;
  const bubbleMaxSize = 48;
  const bubbleMinSize = 30;

  return (
    <div className="w-full">
      {/* Bubble area */}
      <div className="relative w-full" style={{ height: chartHeight }}>
        <div className="flex items-end justify-around h-full px-2">
          {dailyEntries.map((entry, i) => {
            const score = Math.min(10, Math.max(1, Math.round(entry.score)));
            const color = getMoodColor(score);
            const emoji = getMoodEmoji(entry);
            const normalizedScore = (score - 1) / 9;
            const bubbleSize = bubbleMinSize + normalizedScore * (bubbleMaxSize - bubbleMinSize);
            const bottomOffset = normalizedScore * (chartHeight - bubbleMaxSize - 20);

            return (
              <div
                key={i}
                className="flex flex-col items-center relative"
                style={{ flex: 1 }}
              >
                {/* Dotted stem */}
                <div
                  className="absolute bottom-0 w-px"
                  style={{
                    height: bottomOffset + bubbleSize / 2,
                    backgroundImage: `repeating-linear-gradient(to top, ${color}20 0px, ${color}20 3px, transparent 3px, transparent 7px)`,
                  }}
                />

                {/* Bubble */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.15 + i * 0.08,
                    type: 'spring',
                    stiffness: 250,
                    damping: 18,
                  }}
                  className="absolute flex items-center justify-center rounded-full shadow-lg cursor-default group"
                  style={{
                    width: bubbleSize,
                    height: bubbleSize,
                    bottom: bottomOffset,
                    backgroundColor: `${color}20`,
                    border: `2px solid ${color}40`,
                    boxShadow: `0 4px 16px ${color}25`,
                  }}
                >
                  <span style={{ fontSize: bubbleSize * 0.45 }}>{emoji}</span>

                  {/* Tooltip on hover — premium white card */}
                  <div className="absolute -top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    <div
                      className="px-3 py-1.5 rounded-[10px] whitespace-nowrap"
                      style={{
                        background: '#FFFFFF',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                      }}
                    >
                      <span className="text-[12px] font-bold text-slate-800">{score}/10</span>
                      {entry.note && (
                        <span className="text-[11px] text-slate-400 ml-1.5">· {entry.note.slice(0, 20)}</span>
                      )}
                    </div>
                    {/* Arrow */}
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{ background: '#FFFFFF', boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }}
                    />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date labels */}
      <div className="flex justify-around mt-3 px-2">
        {dailyEntries.map((entry, i) => (
          <motion.div
            key={i}
            className="flex flex-col items-center"
            style={{ flex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <span className="text-[8px] font-bold text-muted/60 uppercase tracking-wider">
              {formatWeekday(entry.createdAt)}
            </span>
            <span className="text-[9px] font-bold text-sub mt-0.5">
              {formatDay(entry.createdAt)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
