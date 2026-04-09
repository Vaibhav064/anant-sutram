import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BottomNav } from './components/layout/BottomNav';
import { Splash } from './screens/Splash';
import { Onboarding } from './screens/Onboarding';
import { SignIn } from './screens/SignIn';
import { VerifyEmail } from './screens/VerifyEmail';
import { Home } from './screens/Home';
import { Chat } from './screens/Chat';
import { SOS } from './screens/SOS';
import { Healers } from './screens/Healers';
import { HealerProfile } from './screens/HealerProfile';
import { Journal } from './screens/Journal';
import { Subscribe } from './screens/Subscribe';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Meditate } from './screens/Meditate';
import { AnxietyReset } from './screens/AnxietyReset';
import { GlobalAudioPlayer } from './components/layout/GlobalAudioPlayer';
import { ToastProvider } from './components/ui/Toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useStore } from './store/useStore';

import { API_BASE, apiFetch } from './lib/api';

// ─── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const isAuthLoading = useStore(s => s.isAuthLoading);
  const user = useStore(s => s.user);

  if (isAuthLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
        <div className="flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full border-2 border-[rgba(124,106,245,0.3)] border-t-[#7C6AF5] animate-spin" />
          <p className="text-[13px] font-semibold tracking-[0.2em] text-[rgba(255,255,255,0.3)]">ANANT SUTRAM</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/signin" replace />;
  return children;
};

// ─── Inner App (has router context) ───────────────────────────────────────────
function AppInner() {
  const setUser = useStore(s => s.setUser);
  const setAuthLoading = useStore(s => s.setAuthLoading);
  const { setTheme } = useTheme();

  // On mount: restore session, sync user data + theme
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          const { user } = await res.json();
          setUser(user);
          // Restore theme from user preferences
          if (user.settings?.theme) {
            setTheme(user.settings.theme);
          }
        } else {
          localStorage.removeItem('token');
          setAuthLoading(false);
        }
      } catch {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-[100dvh] overflow-x-hidden relative">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/verify" element={<VerifyEmail />} />

          {/* Protected */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/sos" element={<ProtectedRoute><SOS /></ProtectedRoute>} />
          <Route path="/healers" element={<ProtectedRoute><Healers /></ProtectedRoute>} />
          <Route path="/healers/:id" element={<ProtectedRoute><HealerProfile /></ProtectedRoute>} />
          <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/subscribe" element={<ProtectedRoute><Subscribe /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/meditate" element={<ProtectedRoute><Meditate /></ProtectedRoute>} />
          <Route path="/anxiety-reset" element={<ProtectedRoute><AnxietyReset /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <GlobalAudioPlayer />
        <NavWrapper />
      </div>
    </ToastProvider>
  );
}

// ─── Nav Wrapper ───────────────────────────────────────────────────────────────
function NavWrapper() {
  const location = useLocation();
  const user = useStore(s => s.user);
  const isAuthLoading = useStore(s => s.isAuthLoading);

  const hidePaths = ['/', '/onboarding', '/signin', '/verify', '/sos', '/chat'];
  const hide = hidePaths.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  if (hide || isAuthLoading || !user) return null;
  return <BottomNav />;
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppInner />
      </Router>
    </ThemeProvider>
  );
}
