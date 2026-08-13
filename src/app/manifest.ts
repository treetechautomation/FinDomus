import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinDomus',
    short_name: 'FinDomus',
    description: 'Sua plataforma unificada para gestão financeira, patrimonial e empresarial.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0E14',
    theme_color: '#0A0E14',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['finance', 'business', 'productivity'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-monochrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'monochrome',
      },
    ],
  };
}
