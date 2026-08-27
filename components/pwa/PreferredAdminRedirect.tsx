"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { readPreferredAdminPath } from "@/lib/preferred-admin-path";

// Redirects a device launching the installed PWA at "/" to its remembered
// tenant admin route, if any. Only ever navigates to a validated internal
// "/<slug>/admin" path. Never reads query params, never accepts external URLs.
export default function PreferredAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    const path = readPreferredAdminPath(window.localStorage);
    if (path) {
      router.replace(path);
    }
  }, [router]);

  return null;
}
