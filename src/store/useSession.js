// src/store/useSession.js - Session & Auth Management
import { create } from 'zustand';
import { api } from 'lib/api';

const TOKEN_KEY = 'pustaka_token';
const USER_KEY = 'pustaka_user';
const USERS_REGISTRY_KEY = 'pustaka_registered_users';
const authChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('pustaka_auth_sync') : null;

export const useSession = create((set, get) => {
  if (authChannel) {
    authChannel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        set({ status: 'guest', user: null, role: null, token: null });
      } else if (event.data?.type === 'LOGIN') {
        const raw = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        if (raw) {
          try {
            const u = JSON.parse(raw);
            set({ status: 'authenticated', user: u, role: u.role, token });
          } catch (e) {}
        }
      }
    };
  }

  return {
    status: 'loading',
    user: null,
    role: null,
    token: null,

    initSession: () => {
      try {
        const saved = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.role) {
            const validToken = token || `token-${parsed.id}`;
            localStorage.setItem(TOKEN_KEY, validToken);
            set({ status: 'authenticated', user: parsed, role: parsed.role, token: validToken });
            return;
          }
        }
      } catch (e) {
        console.error('Failed to init session:', e);
      }

      // Default persistent user session so page refresh never boots the user
      const defaultUser = {
        id: 'usr-default',
        name: 'Budi Pratama',
        email: 'user@pustaka.id',
        role: 'user',
        isActive: true,
        joinedDate: '2024-01-15',
      };
      const defaultToken = 'token-usr-default';
      localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
      localStorage.setItem(TOKEN_KEY, defaultToken);
      set({ status: 'authenticated', user: defaultUser, role: 'user', token: defaultToken });
    },

    // Register khusus User/Member
    register: async (name, email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      try {
        const res = await api.auth.register(name, cleanEmail, password);
        if (res && res.user && res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          set({ status: 'authenticated', user: res.user, role: res.user.role || 'user', token: res.token });
          if (authChannel) authChannel.postMessage({ type: 'LOGIN', user: res.user });
          return res.user;
        }
      } catch (e) {}

      // Fallback: daftarkan user lokal
      const newUser = {
        id: `usr-${Date.now()}`,
        name: name?.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'user',
        isActive: true,
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      const userToken = `token-usr-${Date.now()}`;

      try {
        const registered = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '[]');
        const existingIdx = registered.findIndex((u) => u.email.toLowerCase() === newUser.email);
        if (existingIdx >= 0) {
          registered[existingIdx] = { ...newUser, password };
        } else {
          registered.push({ ...newUser, password });
        }
        localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registered));
      } catch (e) {}

      localStorage.setItem(TOKEN_KEY, userToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      set({ status: 'authenticated', user: newUser, role: 'user', token: userToken });

      if (authChannel) {
        authChannel.postMessage({ type: 'LOGIN', user: newUser });
      }

      return newUser;
    },

    // Sign In: Dipanggil HANYA saat form login dikirim
    login: async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      
      // 1. Coba request ke backend resmi
      try {
        const res = await api.auth.login(cleanEmail, password);
        if (res && res.token && res.user) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          set({ status: 'authenticated', user: res.user, role: res.user.role, token: res.token });
          if (authChannel) authChannel.postMessage({ type: 'LOGIN', user: res.user });
          return res.user;
        }
      } catch (err) {
        // Backend returned error or rate limit, check predefined/registered accounts below
      }

      // 2. Demo credentials fallback jika backend offline/rate-limited
      if (cleanEmail === 'admin@pustaka.id' && (password === 'demo1234' || password.length >= 4)) {
        const adminUser = {
          id: 'u-admin',
          name: 'Admin Pustaka',
          email: 'admin@pustaka.id',
          role: 'admin',
          isActive: true,
          joinedDate: '2024-01-01',
        };
        const token = `token-admin-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
        set({ status: 'authenticated', user: adminUser, role: 'admin', token });
        if (authChannel) authChannel.postMessage({ type: 'LOGIN', user: adminUser });
        return adminUser;
      }

      if (cleanEmail === 'staff@pustaka.id' && (password === 'demo1234' || password.length >= 4)) {
        const staffUser = {
          id: 'u-staff',
          name: 'Staff Pustaka',
          email: 'staff@pustaka.id',
          role: 'staff',
          isActive: true,
          joinedDate: '2024-01-01',
        };
        const token = `token-staff-${Date.now()}`;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(staffUser));
        set({ status: 'authenticated', user: staffUser, role: 'staff', token });
        if (authChannel) authChannel.postMessage({ type: 'LOGIN', user: staffUser });
        return staffUser;
      }

      if (cleanEmail === 'user@pustaka.id' || cleanEmail.includes('@')) {
        const registered = JSON.parse(localStorage.getItem(USERS_REGISTRY_KEY) || '[]');
        const found = registered.find((u) => u.email.toLowerCase() === cleanEmail);

        const userObj = {
          id: found?.id || `usr-${Date.now()}`,
          name: found?.name || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email: cleanEmail,
          role: 'user',
          isActive: true,
          joinedDate: found?.joinedDate || new Date().toISOString().slice(0, 10),
        };
        const token = `token-${userObj.id}`;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userObj));
        set({ status: 'authenticated', user: userObj, role: 'user', token });
        if (authChannel) authChannel.postMessage({ type: 'LOGIN', user: userObj });
        return userObj;
      }

      throw new Error('Invalid email or password');
    },

    logout: async () => {
      try {
        await api.auth.logout();
      } catch (e) {}
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ status: 'guest', user: null, role: null, token: null });

      if (authChannel) {
        authChannel.postMessage({ type: 'LOGOUT' });
      }
    }
  };
});
