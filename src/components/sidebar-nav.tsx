'use client';

import {
  ArrowRightLeft,
  BarChart3,
  BookCopy,
  Building2,
  CreditCard,
  LayoutDashboard,
  Repeat2,
  Settings,
  ShieldAlert,
  Target,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AiChatWidget } from '@/components/ai/ai-chat-widget';

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
  { href: '/contas', label: 'Contas', icon: CreditCard },
  { href: '/investimentos', label: 'Investimentos', icon: TrendingUp },
  { href: '/passivos', label: 'Passivos', icon: ShieldAlert },
  { href: '/assinaturas', label: 'Despesas Fixas', icon: Repeat2 },
  { href: '/fiscal-contabil', label: 'Fiscal & Contábil', icon: BookCopy },
  { href: '/importacoes', label: 'Importações', icon: Upload },
  { href: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader className="py-10 lg:py-14 px-6 flex flex-col items-center text-center border-b border-zinc-900/40 mb-6">
        <Link href="/" className="flex flex-col items-center gap-4 group">
          <div className="relative flex w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 max-w-[100px] sm:max-w-[120px] lg:max-w-[160px] max-h-[100px] sm:max-h-[120px] lg:max-h-[160px] items-center justify-center rounded-3xl border border-amber-500/20 bg-zinc-900/60 p-3.5 overflow-hidden shadow-[0_0_25px_rgba(0,190,234,0.12)] group-hover:scale-103 transition-transform duration-300">
            <img src="/logo.png" alt="treeDomus Logo" className="h-full w-full object-contain" />
          </div>
          <div className="space-y-2 mt-2">
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-widest text-white uppercase">
              tree<span className="text-[#f59e0b]">Domus</span>
            </h2>
            <p className="text-xs text-zinc-400 uppercase tracking-widest leading-relaxed font-semibold">
              Suas Finanças.<br />Seu Futuro.<br />Seu Lar.
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 px-2">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href} className="group">
            <Link href={item.href} id={`sidebar-link-${item.href.replace('/', '') || 'overview'}`}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                  "justify-start h-11 px-4 my-1 transition-all duration-300 rounded-xl font-semibold tracking-wide text-zinc-400 hover:text-white border-l-2 border-l-transparent",
                  pathname === item.href 
                    ? "bg-gradient-to-r from-cyan-950/40 via-cyan-900/10 to-transparent text-[#00beea] border-l-[#00beea] shadow-[inset_0_0_12px_rgba(0,190,234,0.05),0_0_15px_rgba(0,190,234,0.08)] font-bold" 
                    : "hover:bg-zinc-900/40 hover:border-l-zinc-700/50 hover:shadow-[0_0_10px_rgba(255,255,255,0.02)]"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                    pathname === item.href 
                      ? "text-[#00beea] drop-shadow-[0_0_8px_rgba(0,190,234,0.6)]" 
                      : {
                          '/': 'text-blue-400',
                          '/planejamento': 'text-indigo-400',
                          '/pessoal': 'text-emerald-400',
                          '/empresas': 'text-cyan-400',
                          '/contas': 'text-teal-400',
                          '/investimentos': 'text-green-400',
                          '/passivos': 'text-red-400',
                          '/assinaturas': 'text-pink-400',
                          '/fiscal-contabil': 'text-yellow-400',
                          '/importacoes': 'text-sky-400',
                          '/relatorios': 'text-purple-400',
                          '/configuracoes': 'text-gray-400',
                        }[item.href] || 'text-muted-foreground'
                  )}
                />
                <span className="ml-1">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <AiChatWidget />
    </>
  );
}
