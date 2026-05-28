'use client';

import {
  ArrowRightLeft,
  BarChart3,
  BookCopy,
  Building2,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Terminal,
  Target,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const menuItems = [
  { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/planejamento', label: 'Planejamento', icon: Target },
  { href: '/pessoal', label: 'Pessoal', icon: Users },
  { href: '/empresas', label: 'Empresas', icon: Building2 },
  { href: '/investimentos', label: 'Investimentos', icon: TrendingUp },
  { href: '/passivos', label: 'Passivos', icon: ShieldAlert },
  { href: '/fiscal-contabil', label: 'Fiscal & Contábil', icon: BookCopy },
  { href: '/imposto-de-renda', label: 'Imposto de Renda', icon: FileText },
  { href: '/importacoes', label: 'Importações', icon: Upload },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/console', label: 'Console', icon: Terminal },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="p-2 bg-primary rounded-md">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-primary-foreground">FinDomus</h1>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                className="justify-start"
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <item.icon
  className={`shrink-0 ${{
    '/': 'text-blue-400',
    '/planejamento': 'text-indigo-400',
    '/pessoal': 'text-emerald-400',
    '/empresas': 'text-cyan-400',
    '/investimentos': 'text-green-400',
    '/passivos': 'text-red-400',
    '/fiscal-contabil': 'text-yellow-400',
    '/imposto-de-renda': 'text-orange-400',
    '/importacoes': 'text-sky-400',
    '/relatorios': 'text-purple-400',
    '/console': 'text-zinc-400',
    '/configuracoes': 'text-gray-400',
  }[item.href] || 'text-muted-foreground'}`}
/>
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}
