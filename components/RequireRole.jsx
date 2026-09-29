// components/RequireRole.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/useSession";

const HOME_BY_ROLE = { user: "/", staff: "/staff", admin: "/admin" };

// Usage: wrap a page's content, e.g. <RequireRole roles={["admin"]}>...</RequireRole>
export default function RequireRole({ roles, children }) {
  const { status, user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest") {
      router.replace("/login");
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace(HOME_BY_ROLE[user.role] || "/");
    }
  }, [status, user, roles, router]);

  if (status !== "authenticated") return null; // or a skeleton
  if (roles && !roles.includes(user.role)) return null;

  return children;
}
