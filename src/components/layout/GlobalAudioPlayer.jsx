import { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function GlobalAudioPlayer() {
  const { isAudioPlaying, setAudioPlaying, audioVolume, activeTrack } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = audioVolume;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // When activeTrack changes, load it
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;

    audio.src = activeTrack;
    if (isAudioPlaying) {
      audio.play().catch(() => {});
    }
  }, [activeTrack]);

  // React to play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudioPlaying && audio.src) {
      audio.play().catch((err) => {
        console.warn('Audio autoplay blocked:', err);
      });
    } else {
      audio.pause();
    }
  }, [isAudioPlaying]);

  // React to volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const showPill = isAudioPlaying && location.pathname !== '/meditate';

  return (
    <AnimatePresence>
      {showPill && (
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95, x: '-50%' }}
          animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
          exit={{ opacity: 0, y: 30, scale: 0.95, x: '-50%' }}
          className="fixed bottom-28 left-1/2 bg-[#1A1A2E]/80 backdrop-blur-xl border border-secondary/30 rounded-full px-5 py-2.5 flex items-center space-x-4 shadow-[0_10px_30px_rgba(8,182,212,0.2)] z-40 cursor-pointer text-white hover:bg-[#1A1A2E] hover:border-secondary/60 transition-colors"
          onClick={() => navigate('/meditate')}
        >
           <div className="flex space-x-1 items-end h-3 pl-1">
             <motion.div animate={{ height: [4,12,4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-secondary rounded-full" />
             <motion.div animate={{ height: [8,4,8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-1 bg-secondary rounded-full" />
             <motion.div animate={{ height: [4,10,4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-secondary rounded-full" />
           </div>
           <span className="text-[12px] font-bold tracking-widest uppercase">Meditating</span>
           <button 
             onClick={(e) => { e.stopPropagation(); setAudioPlaying(false); }} 
             className="p-1 hover:bg-white/10 rounded-full border-none bg-transparent"
           >
             <Pause size={14} className="text-secondary" />
           </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
