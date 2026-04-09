import { Home, Sparkles, Users, PenLine, Leaf } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'home',    path: '/home',     icon: Home,     label: 'Home' },
  { id: 'heal',    path: '/chat',     icon: Sparkles, label: 'Guide' },
  { id: 'reset',   path: '/anxiety-reset', icon: Leaf, label: 'Reset' },
  { id: 'journal', path: '/journal',  icon: PenLine,  label: 'Journal' },
  { id: 'healers', path: '/healers',  icon: Users,    label: 'Healers' },
];

const HIDE_PATHS = ['/', '/onboarding', '/signin', '/sos', '/chat', '/verify'];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDE_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + '/'))) {
    return null;
  }

  return (
    <>
      <div className="h-28" />
      <div className="fixed bottom-0 left-0 right-0 ios-glass border-t border-white/6 z-40">
        <div className="flex justify-around items-center px-2 pt-3 pb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center w-16 py-1 relative transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <div className={`w-10 h-8 flex items-center justify-center rounded-2xl mb-1 transition-all duration-200 ${isActive ? 'bg-primary/15' : 'bg-transparent'}`}>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'text-primary' : ''}
                    style={isActive ? {} : { color: 'var(--text-muted)' }}
                  />
                </div>

                <span
                  className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : ''}`}
                  style={isActive ? {} : { color: 'var(--text-muted)' }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
