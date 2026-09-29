// components/AuthProvider.jsx
"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/useSession";

// Mount this once in app/layout.js, inside <body>, wrapping {children}.
export default function AuthProvider({ children }) {
  const init = useSession((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return children;
}
