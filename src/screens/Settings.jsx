import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sun, Moon, Monitor, Bell, BellOff, Trash2,
  MessageSquare, BookOpen, ShieldAlert, Info, LogOut, ChevronRight, Check
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { ConfirmModal } from '../components/ui/Modal';

import { API_BASE, apiFetch } from '../lib/api';

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6.5 rounded-full transition-all duration-300 shrink-0 ${value ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-soft)]'}`}
      style={{ height: '26px', width: '48px' }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4.5 h-4.5 rounded-full bg-white shadow-sm"
        style={{ width: '18px', height: '18px', top: '4px' }}
      />
    </button>
  );
}

// ─── Theme Option Button ───────────────────────────────────────────────────────
function ThemeOption({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border transition-all ${
        active
          ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary)]/40 text-[var(--color-primary-light)]'
          : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-soft)]'
      }`}
    >
      <Icon size={20} />
      <span className="text-[11px] font-bold">{label}</span>
      {active && <Check size={12} className="text-[var(--color-primary)]" />}
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.18em] mb-3 mt-7 first:mt-0 px-1">
      {label}
    </p>
  );
}

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingsRow({ icon, label, sub, right, onClick, danger = false }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 py-4 border-b border-[var(--border-subtle)] last:border-0 ${onClick ? 'cursor-pointer active:opacity-60' : ''}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-[var(--color-alert)]/12' : 'bg-[var(--bg-elevated)]'}`}>
        <span className={danger ? 'text-[var(--color-alert)]' : 'text-[var(--color-primary-light)]'}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold ${danger ? 'text-[var(--color-alert)]' : 'text-[var(--text-main)]'}`}>{label}</p>
        {sub && <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{sub}</p>}
      </div>
      {right}
      {onClick && !right && <ChevronRight size={15} className="text-[var(--text-muted)] shrink-0" />}
    </div>
  );
}

// ─── Main Settings Screen ─────────────────────────────────────────────────────
export function Settings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme, isDark } = useTheme();
  const user = useStore(s => s.user);
  const clearUser = useStore(s => s.clearUser);
  const updateUserSettings = useStore(s => s.updateUserSettings);
  const getAuthHeader = useStore(s => s.getAuthHeader);

  const settings = user?.settings || {};
  const notifs = settings.notifications || {};

  const [dailyReminders, setDailyReminders] = useState(notifs.dailyReminders ?? true);
  const [meditationReminders, setMeditationReminders] = useState(notifs.meditationReminders ?? true);
  const [journalReminders, setJournalReminders] = useState(notifs.journalReminders ?? false);

  const [confirmClear, setConfirmClear] = useState(null); // 'chat' | 'journal' | 'all'

  const saveNotifSetting = async (key, value) => {
    const newNotifs = { dailyReminders, meditationReminders, journalReminders, [key]: value };
    updateUserSettings({ notifications: newNotifs });

    try {
      await apiFetch('/api/auth/settings', {
        method: 'PATCH',
        body: JSON.stringify({ notifications: { [key]: value } }),
      });
    } catch {
      toast.error('Failed to save setting');
    }
  };

  const handleThemeChange = async (t) => {
    setTheme(t);
    updateUserSettings({ theme: t });
    try {
      await apiFetch('/api/auth/settings', {
        method: 'PATCH',
        body: JSON.stringify({ theme: t }),
      });
    } catch {}
  };

  const handleClearData = async (type) => {
    try {
      if (type === 'chat') {
        await apiFetch('/api/chat/clear', { method: 'DELETE' });
        toast.success('Chat history cleared');
      } else if (type === 'journal') {
        await apiFetch('/api/journal/clear', { method: 'DELETE' });
        toast.success('Journal data cleared');
      } else if (type === 'all') {
        await apiFetch('/api/auth/data', { method: 'DELETE' });
        clearUser();
        navigate('/');
        return;
      }
    } catch {
      toast.error('Failed to clear data. Please try again.');
    }
  };

  const clearLabels = {
    chat: 'Clear all chat history?',
    journal: 'Clear all journal entries?',
    all: 'Delete all app data? This cannot be undone.',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] pb-nav">
      {/* ── Header ── */}
      <div className="sticky top-0 z-30 px-5 pt-12 pb-4 bg-[var(--bg-nav)] backdrop-blur-2xl border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[22px] font-bold text-[var(--text-main)] tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="px-5 pt-6 pb-10">

        {/* ── USER ACCOUNT ── */}
        <SectionHeader label="Account" />
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-1 mb-6">
          {/* Avatar mini display */}
          <div className="flex items-center gap-4 py-4 border-b border-[var(--border-subtle)]">
            <div className="relative">
              {user?.photoUrl ? (
                <img src={user.photoUrl} className="w-12 h-12 rounded-full object-cover border border-[var(--border-soft)]" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center font-bold text-white text-[18px]">
                  {(user?.name || user?.nickname || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-[var(--text-main)] font-semibold text-[15px]">{user?.name || user?.nickname || 'Wanderer'}</p>
              <p className="text-[var(--text-muted)] text-[12px]">{user?.email || ''}</p>
            </div>
          </div>
          <SettingsRow
            icon={<Info size={16} />}
            label="Auth Provider"
            sub={user?.authProvider === 'google' ? 'Google Sign-In' : user?.authProvider === 'both' ? 'Google + Email' : 'Email / Password'}
          />
        </div>

        {/* ── APPEARANCE ── */}
        <SectionHeader label="Appearance" />
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 mb-6">
          <p className="text-[12px] text-[var(--text-muted)] font-semibold mb-3">Theme</p>
          <div className="flex gap-2.5">
            <ThemeOption id="dark" label="Dark" icon={Moon} active={theme === 'dark'} onClick={() => handleThemeChange('dark')} />
            <ThemeOption id="light" label="Light" icon={Sun} active={theme === 'light'} onClick={() => handleThemeChange('light')} />
            <ThemeOption id="system" label="System" icon={Monitor} active={theme === 'system'} onClick={() => handleThemeChange('system')} />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-3 text-center">
            Current: <span className="font-semibold text-[var(--color-primary-light)]">{isDark ? 'Dark Mode 🌙' : 'Light Mode ☀️'}</span>
          </p>
        </div>

        {/* ── NOTIFICATIONS ── */}
        <SectionHeader label="Notifications" />
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-1 mb-6">
          <SettingsRow
            icon={<Bell size={16} />}
            label="Daily Reminders"
            sub="Get notified to check in each day"
            right={
              <Toggle
                value={dailyReminders}
                onToggle={() => {
                  setDailyReminders(!dailyReminders);
                  saveNotifSetting('dailyReminders', !dailyReminders);
                }}
              />
            }
          />
          <SettingsRow
            icon={<Bell size={16} />}
            label="Meditation Reminders"
            sub="Gentle nudges for daily practice"
            right={
              <Toggle
                value={meditationReminders}
                onToggle={() => {
                  setMeditationReminders(!meditationReminders);
                  saveNotifSetting('meditationReminders', !meditationReminders);
                }}
              />
            }
          />
          <SettingsRow
            icon={<BookOpen size={16} />}
            label="Journal Reminders"
            sub="Evening reflection prompts"
            right={
              <Toggle
                value={journalReminders}
                onToggle={() => {
                  setJournalReminders(!journalReminders);
                  saveNotifSetting('journalReminders', !journalReminders);
                }}
              />
            }
          />
        </div>

        {/* ── PRIVACY ── */}
        <SectionHeader label="Privacy & Data" />
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-1 mb-6">
          <SettingsRow
            icon={<MessageSquare size={16} />}
            label="Clear Chat History"
            sub="Remove all AI conversation history"
            onClick={() => setConfirmClear('chat')}
            danger
          />
          <SettingsRow
            icon={<BookOpen size={16} />}
            label="Clear Journal Data"
            sub="Delete all your journal entries"
            onClick={() => setConfirmClear('journal')}
            danger
          />
          <SettingsRow
            icon={<Trash2 size={16} />}
            label="Delete All App Data"
            sub="Permanently remove all data and sign out"
            onClick={() => setConfirmClear('all')}
            danger
          />
        </div>

        {/* ── ABOUT ── */}
        <SectionHeader label="Support" />
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 py-1 mb-6">
          <SettingsRow
            icon={<Info size={16} />}
            label="About Anant Sutram"
            sub="v1.2.0 · Made with 💜 for mental wellness"
            chevron={false}
          />
          <SettingsRow
            icon={<ShieldAlert size={16} />}
            label="Privacy Policy"
            onClick={() => {}}
          />
        </div>

        {/* ── SIGN OUT ── */}
        <button
          onClick={() => { clearUser(); navigate('/'); }}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[var(--color-alert)]/10 border border-[var(--color-alert)]/20 text-[var(--color-alert)] font-bold text-[15px] hover:bg-[var(--color-alert)]/18 transition-all active:scale-[0.98]"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>

      {/* ── Privacy Clear Confirm ── */}
      <ConfirmModal
        isOpen={!!confirmClear}
        onClose={() => setConfirmClear(null)}
        onConfirm={() => { handleClearData(confirmClear); setConfirmClear(null); }}
        title="Are you sure?"
        message={confirmClear ? clearLabels[confirmClear] : ''}
        confirmLabel="Yes, clear"
        confirmVariant="danger"
      />
    </div>
  );
}
