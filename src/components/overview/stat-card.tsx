import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority'

const statCardVariants = cva(
  "border-l-4",
  {
    variants: {
      variant: {
        default: "border-primary",
        positive: "border-positive",
        negative: "border-negative",
          warning: "border-yellow-500",
      },
      size: {
        default: "text-base",
        sm: "text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    },
  }
)

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  className?: string;
  glowColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export function StatCard({ title, value, icon: Icon, description, variant, size, className, glowColor }: StatCardProps) {
  const isSmall = size === 'sm';
  
  // Custom class determination for premium glows
  const glowClasses = glowColor ? {
    blue: "border-cyan-500 bg-slate-950/70 border border-slate-800/40 shadow-[0_0_25px_rgba(6,182,212,0.03)] hover:shadow-[0_0_35px_rgba(6,182,212,0.12)] hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-0.5",
    green: "border-emerald-500 bg-slate-950/70 border border-slate-800/40 shadow-[0_0_25px_rgba(16,185,129,0.03)] hover:shadow-[0_0_35px_rgba(16,185,129,0.12)] hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-0.5",
    orange: "border-amber-500 bg-slate-950/70 border border-slate-800/40 shadow-[0_0_25px_rgba(245,158,11,0.03)] hover:shadow-[0_0_35px_rgba(245,158,11,0.12)] hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-0.5",
    purple: "border-purple-500 bg-slate-950/70 border border-slate-800/40 shadow-[0_0_25px_rgba(168,85,247,0.03)] hover:shadow-[0_0_35px_rgba(168,85,247,0.12)] hover:border-purple-400/50 transition-all duration-300 hover:-translate-y-0.5",
    red: "border-rose-500 bg-slate-950/70 border border-slate-800/40 shadow-[0_0_25px_rgba(244,63,94,0.03)] hover:shadow-[0_0_35px_rgba(244,63,94,0.12)] hover:border-rose-400/50 transition-all duration-300 hover:-translate-y-0.5"
  }[glowColor] : "border-slate-800 bg-slate-950/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-0.5";

  // Icon custom colors
  const iconColor = glowColor ? {
    blue: "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]",
    green: "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    orange: "text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    purple: "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
    red: "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
  }[glowColor] : "text-muted-foreground";

  return (
    <Card className={cn("rounded-3xl border-l-4 overflow-hidden relative group transition-all duration-300", glowClasses, className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", isSmall ? "pb-1 pt-4 px-4" : "")}>
        <CardTitle className={cn("font-semibold text-zinc-400 tracking-wide", isSmall ? "text-xs" : "text-sm")}>{title}</CardTitle>
        <div className={cn("p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]", isSmall ? "p-1.5" : "")}>
          <Icon className={cn("h-6 w-6 transition-transform duration-300 group-hover:scale-110", iconColor, isSmall ? "h-4 w-4" : "")} />
        </div>
      </CardHeader>
      <CardContent className={cn(isSmall ? "pb-4 px-4" : "")}>
        <div className={cn("font-extrabold tracking-tight text-white", isSmall ? "text-lg" : "text-3xl")}>{value}</div>
        {description && <p className={cn("text-zinc-500 font-light mt-1", isSmall ? "text-[10px]" : "text-xs")}>{description}</p>}
      </CardContent>
    </Card>
  );
}