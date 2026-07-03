'use client';

import { Badge } from '@/components/ui/badge';
import { Crown, Clock } from 'lucide-react';

interface PlanBadgeProps {
  planName: string;
  isTrial?: boolean;
  trialDaysRemaining?: number | null;
  isCampaignPrice?: boolean;
  className?: string;
}

export function PlanBadge({
  planName,
  isTrial,
  trialDaysRemaining,
  isCampaignPrice,
  className,
}: PlanBadgeProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <Badge
        className={`text-xs font-semibold ${
          planName === 'Família Premium'
            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            : planName === 'Família'
            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            : 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
        }`}
      >
        {planName === 'Família' && <Crown className="h-3 w-3 mr-1" />}
        {planName}
      </Badge>

      {isTrial && trialDaysRemaining !== null && trialDaysRemaining !== undefined && (
        <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
          <Clock className="h-3 w-3 mr-1" />
          {trialDaysRemaining}d restantes
        </Badge>
      )}

      {isCampaignPrice && (
        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Preço de lançamento
        </Badge>
      )}
    </div>
  );
}
