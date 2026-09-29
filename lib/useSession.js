// lib/useSession.js
"use client";

import { create } from "zustand";
import { api } from "./api";

const bc = typeof window !== "undefined" ? new BroadcastChannel("pustaka_auth_sync") : null;

export const useSession = create((set, get) => ({
  status: "loading", // loading | guest | authenticated
  user: null,
  token: null,

  // Call this once on app mount (see components/AuthProvider.jsx)
  init: () => {
    const token = localStorage.getItem("pustaka_token");
    const rawUser = localStorage.getItem("pustaka_user");
    if (token && rawUser) {
      set({ status: "authenticated", token, user: JSON.parse(rawUser) });
    } else {
      set({ status: "guest", token: null, user: null });
    }
  },

  login: async (email, password) => {
    const { token, user } = await api.auth.login(email, password);
    localStorage.setItem("pustaka_token", token);
    localStorage.setItem("pustaka_user", JSON.stringify(user));
    set({ status: "authenticated", token, user });
    bc?.postMessage({ type: "LOGIN" });
    return user;
  },

  logout: () => {
    localStorage.removeItem("pustaka_token");
    localStorage.removeItem("pustaka_user");
    set({ status: "guest", token: null, user: null });
    bc?.postMessage({ type: "LOGOUT" });
  },
}));

// Keep tabs in sync: logging out (or in) in one tab reflects in the others.
if (bc) {
  bc.onmessage = (e) => {
    if (e.data.type === "LOGOUT") useSession.setState({ status: "guest", token: null, user: null });
    if (e.data.type === "LOGIN") useSession.getState().init();
  };
}
