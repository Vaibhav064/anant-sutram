import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // State Hydration
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

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

      // ─── Chat Sessions (persisted) ────────────────────────────────────────────────
      // Each session: { id, persona, personaName, personaIcon, messages[], createdAt, updatedAt, title }
      chatSessions: [],
      activeChatSessionId: null,

      // ─── Derived helpers ─────────────────────────────────────────────────────────
      getDisplayName: () => {
        const user = get().user;
        if (!user) return 'Wanderer';
        if (user.name && user.name.trim()) return user.name.trim();
        if (user.nickname && user.nickname !== 'Wanderer') return user.nickname;
        if (user.email) return user.email.split('@')[0];
        return 'Wanderer';
      },

      getFirstName: () => {
        const name = get().getDisplayName();
        return name.split(' ')[0];
      },

      getAvatarInitial: () => {
        const name = get().getDisplayName();
        return name.charAt(0).toUpperCase();
      },

      // ─── Actions ──────────────────────────────────────────────────────────────────
      setUser: (user) => set({ user, isAuthLoading: false }),
      setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

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

      // ─── Chat Session Actions ────────────────────────────────────────────────────
      createChatSession: (persona, personaName, personaIcon) => {
        const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const title = `${personaName} chat`;
        const newSession = {
          id,
          persona,
          personaName,
          personaIcon,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title,
        };
        const sessions = get().chatSessions || [];
        // Keep max 30 sessions (drop oldest)
        const trimmed = [newSession, ...sessions].slice(0, 30);
        set({ chatSessions: trimmed, activeChatSessionId: id });
        return id;
      },

      updateChatSession: (id, messages) => {
        const currentSessions = get().chatSessions || [];
        const sessions = currentSessions.map(s =>
          s.id === id
            ? {
                ...s,
                messages: messages.slice(-100), // max 100 messages per session
                updatedAt: new Date().toISOString(),
                // auto-generate title from first user message
                title: s.title === `${s.personaName} chat` && messages.find(m => m.role === 'user')
                  ? (messages.find(m => m.role === 'user').content.slice(0, 40) + (messages.find(m => m.role === 'user').content.length > 40 ? '…' : ''))
                  : s.title,
              }
            : s
        );
        set({ chatSessions: sessions });
      },

      deleteChatSession: (id) => {
        const sessions = (get().chatSessions || []).filter(s => s.id !== id);
        const activeChatSessionId = get().activeChatSessionId === id ? null : get().activeChatSessionId;
        set({ chatSessions: sessions, activeChatSessionId });
      },

      setActiveChatSession: (id) => set({ activeChatSessionId: id }),

      getChatSession: (id) => (get().chatSessions || []).find(s => s.id === id) || null,

      // ─── Clear / Logout ──────────────────────────────────────────────────────────
      clearUser: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthLoading: false,
          moodScore: null,
          todayMoodEntry: null,
          isAudioPlaying: false,
          anxietyResetProgress: null,
          activeChatSessionId: null,
          // chatSessions intentionally kept — history survives re-login
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
    }),
    {
      name: 'anant-sutram-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2, // Bump version to force clean state or handle migration
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Rehydration error:', error);
          } else if (rehydratedState) {
            rehydratedState.setHasHydrated(true);
          }
        };
      },
      migrate: (persistedState, version) => {
        if (version === 0 || version === 1) {
          // If we are migrating from version 0 or 1, ensure chatSessions is an array
          if (persistedState && typeof persistedState === 'object') {
            persistedState.chatSessions = persistedState.chatSessions || [];
          }
        }
        return persistedState;
      },
    }
  )
)
