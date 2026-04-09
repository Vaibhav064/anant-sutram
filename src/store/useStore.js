import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  isAuthLoading: true,

  // Mood
  moodScore: null,
  todayMoodEntry: null,

  // Audio
  isAudioPlaying: false,
  audioVolume: 0.5,
  activeTrack: null,

  // 21-day progress (cached from server)
  anxietyResetProgress: null,

  // ─── Derived helpers ─────────────────────────────────────────────────────────
  // Display name: real name > nickname > first part of email > 'Wanderer'
  getDisplayName: () => {
    const user = get().user;
    if (!user) return 'Wanderer';
    if (user.name && user.name.trim()) return user.name.trim();
    if (user.nickname && user.nickname !== 'Wanderer') return user.nickname;
    if (user.email) return user.email.split('@')[0];
    return 'Wanderer';
  },

  // First name only
  getFirstName: () => {
    const name = get().getDisplayName();
    return name.split(' ')[0];
  },

  // Avatar initial
  getAvatarInitial: () => {
    const name = get().getDisplayName();
    return name.charAt(0).toUpperCase();
  },

  // ─── Actions ──────────────────────────────────────────────────────────────────
  setUser: (user) => set({ user, isAuthLoading: false }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

  // Legacy compat — nickname is now derived from user.name
  setNickname: (nickname) => {
    const user = get().user;
    if (user) set({ user: { ...user, nickname } });
  },

  setMood: (score, entry = null) => set({ moodScore: score, todayMoodEntry: entry }),

  setAudioPlaying: (isAudioPlaying) => set({ isAudioPlaying }),
  setAudioVolume: (audioVolume) => set({ audioVolume }),
  setActiveTrack: (activeTrack) => set({ activeTrack }),

  setAnxietyResetProgress: (anxietyResetProgress) => set({ anxietyResetProgress }),

  updateUserSettings: (settings) => {
    const user = get().user;
    if (user) set({ user: { ...user, settings: { ...user.settings, ...settings } } });
  },

  clearUser: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthLoading: false,
      moodScore: null,
      todayMoodEntry: null,
      isAudioPlaying: false,
      anxietyResetProgress: null,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    get().clearUser();
  },

  getAuthHeader: () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

  // Legacy compat
  get nickname() { return get().getDisplayName(); },
  get subscriptionTier() { return get().user?.subscription || 'free'; },
}))
