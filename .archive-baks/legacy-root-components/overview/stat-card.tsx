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
}

export function StatCard({ title, value, icon: Icon, description, variant, size, className }: StatCardProps) {
  const isSmall = size === 'sm';
  return (
    <Card className={cn(statCardVariants({ variant }), className)}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", isSmall ? "pb-1 pt-4 px-4" : "pb-2")}>
        <CardTitle className={cn("font-medium", isSmall ? "text-sm" : "text-base")}>{title}</CardTitle>
        <Icon className={cn("text-muted-foreground", isSmall ? "h-4 w-4" : "h-5 w-5")} />
      </CardHeader>
      <CardContent className={cn(isSmall ? "pb-4 px-4" : "")}>
        <div className={cn("font-bold", isSmall ? "text-xl" : "text-2xl")}>{value}</div>
        {description && <p className={cn("text-muted-foreground", isSmall ? "text-xs" : "text-sm")}>{description}</p>}
      </CardContent>
    </Card>
  );
}