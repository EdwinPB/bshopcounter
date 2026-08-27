"use client";

import { useEffect } from "react";

// Registers the minimal service worker in production only.
// In dev, service workers are skipped to avoid stale assets.
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // Registration is best-effort; failure must never affect the app.
        });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
