'use client';

import { useEffect } from 'react';

function register(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  const swUrl = '/sw.js';

  navigator.serviceWorker
    .register(swUrl, { scope: '/' })
    .then((registration) => {
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (
            installingWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            window.location.reload();
          }
        });
      });
    })
    .catch(() => {
      // SW registration failed silently — app continues normally
    });
}

export function SwRegistrar(): null {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      register();
    }
  }, []);

  return null;
}
