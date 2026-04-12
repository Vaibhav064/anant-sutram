import { Home, Sparkles, RefreshCw, PenLine, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home',    path: '/home',          icon: Home,      label: 'Home' },
  { id: 'lumina',  path: '/chat',          icon: Sparkles,  label: 'Anant' },
  { id: 'reset',   path: '/anxiety-reset', icon: RefreshCw, label: 'Reset' },
  { id: 'journal', path: '/journal',       icon: PenLine,   label: 'Journal' },
  { id: 'healers', path: '/healers',       icon: Users,     label: 'Healers' },
];

const HIDE_PATHS = ['/', '/onboarding', '/signin', '/sos', '/chat', '/verify'];

export function BottomNav() {
  const location = useLocation();
  const navigate  = useNavigate();

  // Hide on exact auth/utility paths only
  const shouldHide = HIDE_PATHS.some(p => location.pathname === p);
  if (shouldHide) return null;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(255,255,255,0.84)',
          backdropFilter: 'blur(28px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.06), 0 -4px 20px rgba(80,60,180,0.08)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 6px)',
        }}
      >
        <div className="flex justify-around items-center px-2 pt-2 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            // Precise active check: exact match OR nested sub-paths (not other tabs)
            const isActive =
              location.pathname === tab.path ||
              (tab.path !== '/' && location.pathname.startsWith(tab.path + '/'));

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center flex-1 py-1.5 relative active:scale-90 transition-transform duration-150 group"
              >
                {/* Active bar indicator at top */}
                {isActive && (
                  <motion.div
                    className="absolute top-[-2px] h-[3px] rounded-full"
                    style={{ background: 'var(--color-primary)', width: '20px', left: '50%' }}
                    initial={{ scaleX: 0, opacity: 0, x: "-50%" }}
                    animate={{ scaleX: 1, opacity: 1, x: "-50%" }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                <motion.div
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="mb-0.5"
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    style={{
                      color: isActive ? 'var(--color-primary)' : '#9DAABE',
                      transition: 'color 0.18s ease',
                    }}
                  />
                </motion.div>

                <span
                  className="text-[10px] font-black tracking-tight"
                  style={{
                    color: isActive ? 'var(--color-primary)' : '#9DAABE',
                    transition: 'color 0.18s ease',
                  }}
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
