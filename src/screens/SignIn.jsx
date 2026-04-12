import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, X } from 'lucide-react';
import { API_BASE, apiFetch } from '../lib/api';
import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

// ─── Google Icon SVG ───────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Animated background ───────────────────────────────────────────────────────
function BgOrbs() {
  return (
    <>
      <motion.div
        animate={{ opacity: [0.12, 0.25, 0.12], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -top-24 -left-24"
        style={{ background: 'radial-gradient(circle, rgba(124,106,245,0.35) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, delay: 3 }}
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none -bottom-24 -right-24"
        style={{ background: 'radial-gradient(circle, rgba(192,132,252,0.25) 0%, transparent 70%)' }}
      />
    </>
  );
}

// ─── Verify email screen ───────────────────────────────────────────────────────
function VerifyEmailScreen({ email, onBack }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend');
      if (data.message === 'auto_verified') { onBack(); return; }
      setResent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="z-10 w-full max-w-sm text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-6xl mb-6"
      >📬</motion.div>

      <h1 className="text-[28px] text-main font-bold mb-2 tracking-tight">Check your inbox</h1>
      <p className="text-muted text-sm mb-1">We sent a verification link to</p>
      <p className="text-primary font-semibold text-[15px] mb-8 break-all">{email}</p>

      <div className="bg-surface border border-subtle rounded-2xl p-5 text-left mb-8 space-y-3">
        {['1. Open the email from Anant Sutram', '2. Click "Verify Email Address"', '3. Come back here and sign in'].map(s => (
          <p key={s} className="text-sub text-[13px] font-medium">{s}</p>
        ))}
      </div>

      {error && <div className="bg-alert/10 border border-alert/20 text-alert p-3 rounded-2xl text-[13px] font-medium mb-4">{error}</div>}

      {resent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-success/10 border border-success/20 text-success p-3 rounded-2xl text-[13px] font-medium mb-4">
          ✅ Verification email resent!
        </motion.div>
      ) : (
        <button onClick={handleResend} disabled={resending}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-[15px] hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 mb-4 btn-glow">
          {resending ? 'Sending...' : 'Resend Verification Email'}
        </button>
      )}

      <button onClick={onBack} className="text-[13px] text-muted hover:text-sub transition-colors font-medium">
        ← Back to Sign In
      </button>
    </motion.div>
  );
}

// ─── Main SignIn ───────────────────────────────────────────────────────────────
export function SignIn() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingEmail, setPendingEmail] = useState(null);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  const setNickname = useStore(s => s.setNickname);
  const setUser = useStore(s => s.setUser);
  const user = useStore(s => s.user);

  useEffect(() => { if (user) navigate('/home'); }, [user]);

  // ─── Load Google Identity Services ────────────────────────────────────────────
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    if (Capacitor.isNativePlatform()) {
      try {
        GoogleSignIn.initialize({ clientId });
      } catch (err) {
        console.warn('Failed to initialize Capacitor Google Sign-In', err);
      }
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Detect missing or placeholder client ID
    const isPlaceholder = !clientId ||
      clientId === 'your_google_client_id_here' ||
      clientId.trim() === '' ||
      clientId.endsWith('_here');

    if (isPlaceholder) {
      setShowGoogleSetup(true);
      return;
    }

    setGoogleLoading(true);
    setErrorMsg('');

    if (Capacitor.isNativePlatform()) {
      try {
        const result = await GoogleSignIn.signIn();
        await handleGoogleCallback(null, result.idToken);
      } catch (err) {
        console.error('Capacitor Google Auth error:', err);
        setErrorMsg('Google sign-in was cancelled or failed.');
        setGoogleLoading(false);
      }
      return;
    }

    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (response) => {
          if (response.error) {
            setErrorMsg('Google sign-in was cancelled or failed.');
            setGoogleLoading(false);
            return;
          }
          await handleGoogleCallback(response.access_token, null);
        },
      });
      client.requestAccessToken();
    } else {
      setErrorMsg('Google services not loaded. Please refresh and try again.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleCallback = async (accessToken, idToken) => {
    try {
      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ accessToken, idToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google sign-in failed');

      localStorage.setItem('token', data.token);
      setUser(data.user);

      // Force strictly light theme ignoring legacy user settings
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('anant_theme', 'light');

      if (data.isNew) navigate('/onboarding');
      else navigate('/home');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!isLogin && res.ok && data.message === 'auto_verified') {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/onboarding');
        return;
      }
      if (!isLogin && res.ok && (data.message === 'verification_sent' || data.message === 'verification_resent')) {
        setPendingEmail(data.email);
        return;
      }
      if (res.status === 403 && data.error === 'email_not_verified') {
        setPendingEmail(data.email);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setNickname(data.user.nickname);
      
      // Enforce premium wellness light theme explicitly on login
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('anant_theme', 'light');

      if (isLogin) navigate('/home');
      else navigate('/onboarding');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnon = () => {
    setNickname('Anonymous');
    navigate('/home');
  };

  // ─── Google Setup Modal ────────────────────────────────────────────────────────
  const GoogleSetupModal = () => (
    <AnimatePresence>
      {showGoogleSetup && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowGoogleSetup(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200]" />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-x-4 z-[201] top-1/2 -translate-y-1/2 max-w-md mx-auto"
          >
            <div className="bg-surface border border-subtle rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/5 border-b border-subtle px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-subtle flex items-center justify-center shadow-sm">
                    <GoogleIcon />
                  </div>
                  <div>
                    <h3 className="text-main font-bold text-[16px] tracking-tight">Setup Google Sign-In</h3>
                    <p className="text-muted text-[11px]">One-time configuration needed</p>
                  </div>
                </div>
                <button onClick={() => setShowGoogleSetup(false)} className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-muted hover:text-main transition-all">
                  <X size={14} />
                </button>
              </div>

              <div className="px-6 py-5">
                <p className="text-sub text-[13px] leading-relaxed mb-5">
                  Google sign-in needs a Client ID from Google Cloud Console. It's free and takes about 3 minutes.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { step: '1', text: 'Go to console.cloud.google.com', action: 'Open Google Cloud Console', url: 'https://console.cloud.google.com/apis/credentials' },
                    { step: '2', text: 'Create OAuth 2.0 Client ID (Web application)' },
                    { step: '3', text: 'Add http://localhost:5173 as Authorized JavaScript Origin' },
                    { step: '4', text: 'Copy the Client ID and paste it below' },
                  ].map(({ step, text, url }) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">{step}</span>
                      <div>
                        <p className="text-main text-[13px] font-medium">{text}</p>
                        {url && (
                           <a href={url} target="_blank" rel="noopener noreferrer"
                             className="text-primary text-[12px] font-semibold hover:underline">
                             → Open Google Cloud Console
                           </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-surface2 rounded-2xl border border-subtle p-3 mb-5">
                  <p className="text-muted text-[9px] font-bold uppercase tracking-widest mb-1">Add to .env.local</p>
                  <code className="text-primary text-[12px] font-mono block select-all">
                    VITE_GOOGLE_CLIENT_ID=&quot;paste-your-id-here.apps.googleusercontent.com&quot;
                  </code>
                </div>

                <p className="text-muted text-[12px] text-center mb-4">After adding, restart the dev server with <code className="text-sub font-mono">npm run dev</code></p>

                <button
                  onClick={() => setShowGoogleSetup(false)}
                  className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-[14px] hover:opacity-90 transition-all"
                >
                  Got it, I'll set this up
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (pendingEmail) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <BgOrbs />
        <AnimatePresence mode="wait">
          <VerifyEmailScreen key="verify" email={pendingEmail} onBack={() => { setPendingEmail(null); setIsLogin(true); }} />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <BgOrbs />
      <GoogleSetupModal />

      <div className="z-10 w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-110" />
            <div className="relative w-20 h-20 rounded-[28px] bg-white border border-subtle flex items-center justify-center shadow-lg">
              <span className="text-4xl drop-shadow-sm">🪷</span>
            </div>
          </div>
          <h1 className="text-[38px] text-main font-black tracking-tight mb-2 leading-none">
            {isLogin ? 'Welcome back' : 'Begin healing'}
          </h1>
          <p className="text-sub text-[15px] font-bold tracking-tight">
            {isLogin ? 'Continue your journey inward.' : 'Your safe space awaits.'}
          </p>
        </motion.div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-alert/10 border border-alert/20 text-alert p-3.5 rounded-2xl text-[13px] font-medium tracking-tight text-center overflow-hidden mb-4"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Sign-In */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full h-16 mb-4 rounded-[22px] bg-surface border border-subtle text-main font-bold text-[15px] flex items-center justify-center gap-3 hover:bg-surface2 transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm"
        >
          {googleLoading ? (
            <span className="w-5 h-5 border-2 border-muted border-t-main rounded-full animate-spin" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-white border border-subtle flex items-center justify-center shadow-sm">
              <GoogleIcon />
            </div>
          )}
          {googleLoading ? 'Accessing...' : 'Sign in with Google'}
        </motion.button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-subtle" />
          </div>
          <div className="relative bg-bg px-4 text-[11px] text-muted uppercase tracking-[0.2em] font-bold">or</div>
        </div>

        {/* Email/Password form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleAuth}
          className="flex flex-col space-y-3"
        >
          {/* Email */}
          <div className="relative group">
            <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-subtle rounded-[22px] pl-12 pr-6 py-4 text-main text-[15px] placeholder:text-muted focus:outline-none focus:border-primary/50 focus:bg-surface2 transition-all font-medium shadow-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-subtle rounded-[22px] pl-12 pr-12 py-4 text-main text-[15px] placeholder:text-muted focus:outline-none focus:border-primary/50 focus:bg-surface2 transition-all font-medium shadow-sm"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-colors"
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-16 rounded-[22px] bg-primary text-white font-black text-[15px] uppercase tracking-[0.2em] btn-glow hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 shadow-glow-primary"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Enter Space' : 'Begin Journey'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </motion.form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="text-[13px] text-primary/90 font-bold hover:text-primary transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-subtle" />
          </div>
          <div className="relative bg-bg px-4 text-[11px] text-muted uppercase tracking-[0.2em] font-bold">or</div>
        </div>

        <button
          onClick={handleAnon}
          className="w-full py-3.5 rounded-2xl bg-surface text-sub font-medium text-[14px] border border-subtle hover:bg-surface2 hover:text-main transition-all shadow-sm"
        >
          Continue Anonymously
        </button>

        <p className="mt-10 text-center text-muted text-[11px] leading-relaxed px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
          Your journal and chats are end-to-end encrypted.
        </p>
      </div>
    </div>
  );
}
