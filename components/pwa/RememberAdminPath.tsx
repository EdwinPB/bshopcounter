"use client";

import { useEffect } from "react";
import { savePreferredAdminPath } from "@/lib/preferred-admin-path";

// Saves the currently authenticated tenant's admin route as the device's
// preferred PWA landing path. Rendered only in the authorized admin branch,
// so it runs only after a successful authentication.
export default function RememberAdminPath({ slug }: { slug: string }) {
  useEffect(() => {
    savePreferredAdminPath(window.localStorage, `/${slug}/admin`);
  }, [slug]);

  return null;
}
