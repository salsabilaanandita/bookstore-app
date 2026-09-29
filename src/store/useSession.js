// src/store/useSession.js
// Session & Authentication Management

import { create } from 'zustand';
import { api } from 'lib/api';

const TOKEN_KEY = 'pustaka_token';
const USER_KEY = 'pustaka_user';

const authChannel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('pustaka_auth_sync')
    : null;

export const useSession = create((set, get) => {
  // Sync login/logout antar tab
  if (authChannel) {
    authChannel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        set({
          status: 'guest',
          user: null,
          role: null,
          token: null,
        });
      }

      if (event.data?.type === 'LOGIN') {
        const rawUser = localStorage.getItem(USER_KEY);
        const token = localStorage.getItem(TOKEN_KEY);

        if (rawUser && token) {
          try {
            const user = JSON.parse(rawUser);

            set({
              status: 'authenticated',
              user,
              role: user.role,
              token,
            });
          } catch {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(TOKEN_KEY);
          }
        }
      }
    };
  }

  return {
    status: 'loading',
    user: null,
    role: null,
    token: null,

    // ==========================================
    // INIT SESSION
    // ==========================================

    initSession: async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const rawUser = localStorage.getItem(USER_KEY);

        // Tidak ada session
        if (!token || !rawUser) {
          set({
            status: 'guest',
            user: null,
            role: null,
            token: null,
          });

          return;
        }

        const localUser = JSON.parse(rawUser);

        // Token harus JWT
        if (!token.includes('.')) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);

          set({
            status: 'guest',
            user: null,
            role: null,
            token: null,
          });

          return;
        }

        // Verifikasi token ke backend
        try {
          const response = await api.auth.me();

          const user =
            response?.user ||
            response?.data?.user ||
            response?.data ||
            response;

          if (!user) {
            throw new Error('User session tidak ditemukan');
          }

          localStorage.setItem(USER_KEY, JSON.stringify(user));

          set({
            status: 'authenticated',
            user,
            role: user.role,
            token,
          });

          return;
        } catch (error) {
          console.warn('Session tidak valid:', error.message);

          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);

          set({
            status: 'guest',
            user: null,
            role: null,
            token: null,
          });
        }
      } catch (error) {
        console.error('Failed to initialize session:', error);

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        set({
          status: 'guest',
          user: null,
          role: null,
          token: null,
        });
      }
    },

    // ==========================================
    // REGISTER
    // ==========================================

    register: async (name, email, password) => {
      const cleanEmail = email.trim().toLowerCase();

      const response = await api.auth.register(
        name.trim(),
        cleanEmail,
        password
      );

      if (!response?.token || !response?.user) {
        throw new Error('Register berhasil tetapi token tidak diterima');
      }

      const user = response.user;
      const token = response.token;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        status: 'authenticated',
        user,
        role: user.role,
        token,
      });

      if (authChannel) {
        authChannel.postMessage({
          type: 'LOGIN',
          user,
        });
      }

      return user;
    },

    // ==========================================
    // LOGIN
    // ==========================================

    login: async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();

      // SELALU gunakan backend.
      // Jangan lagi membuat token palsu dari frontend.
      const response = await api.auth.login(
        cleanEmail,
        password
      );

      if (!response?.token || !response?.user) {
        throw new Error(
          'Login berhasil tetapi server tidak mengirim token'
        );
      }

      const user = response.user;
      const token = response.token;

      // Simpan JWT asli dari backend
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        status: 'authenticated',
        user,
        role: user.role,
        token,
      });

      if (authChannel) {
        authChannel.postMessage({
          type: 'LOGIN',
          user,
        });
      }

      return user;
    },

    // ==========================================
    // LOGOUT
    // ==========================================

    logout: async () => {
      try {
        await api.auth.logout();
      } catch (error) {
        console.warn('Backend logout:', error.message);
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      set({
        status: 'guest',
        user: null,
        role: null,
        token: null,
      });

      if (authChannel) {
        authChannel.postMessage({
          type: 'LOGOUT',
        });
      }
    },
  };
});
