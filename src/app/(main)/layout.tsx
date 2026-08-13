import { ProtectedRoute } from '@/components/auth/protected-route';
import { LayoutRouter } from '@/components/mobile/layout/layout-router';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <LayoutRouter>{children}</LayoutRouter>
    </ProtectedRoute>
  );
}
