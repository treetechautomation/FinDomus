import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/auth-provider';
import { VisibilityProvider } from '@/providers/visibility-provider';
import { AcademyRenderer } from '@/components/academy';
import { AcademyProvider } from '@/components/academy/academy-provider';
import { SchedulerInit } from '@/components/scheduler-init';
import { SnapshotCacheProvider } from '@/providers/snapshot-cache-provider';
import { SwRegistrar } from '@/components/sw-registrar';

export const metadata: Metadata = {
  title: 'FinDomus - Unified Financial Platform',
  description: 'Sua plataforma unificada para gestão financeira, patrimonial e empresarial.',
  applicationName: 'FinDomus',
  manifest: '/manifest.webmanifest',
  icons: {
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: 'FinDomus',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0E14' },
    { media: '(prefers-color-scheme: light)', color: '#F8F9FB' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <VisibilityProvider>
            <SnapshotCacheProvider>
              <AcademyProvider>
                {children}
                <SchedulerInit />
                <AcademyRenderer />
                <Toaster />
                <SwRegistrar />
              </AcademyProvider>
            </SnapshotCacheProvider>
          </VisibilityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

