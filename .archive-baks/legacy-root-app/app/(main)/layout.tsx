import { AppHeader } from '@/components/app-header';
import { SidebarNav } from '@/components/sidebar-nav';
import { MarketTicker } from '@/components/investimentos/market-ticker';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 overflow-x-hidden">
        <AppHeader />
        <MarketTicker />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1800px] min-w-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
