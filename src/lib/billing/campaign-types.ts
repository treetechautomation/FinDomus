export interface CampaignPlanPricing {
  officialPrice: number;
  campaignPrice: number;
}

export interface CampaignStats {
  totalRevenue: number;
  conversions: number;
  views: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'launch' | 'black_friday' | 'natal' | 'parceiros' | 'afiliados' | 'cupom' | 'custom';
  enabled: boolean;
  seatsLimit: number | null;
  seatsUsed: number;
  plans: Record<string, CampaignPlanPricing>;
  couponCode?: string;
  affiliateId?: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats: CampaignStats;
}

export interface PublicCampaign {
  enabled: boolean;
  name: string;
  seatsLimit: number | null;
  seatsUsed: number;
  seatsRemaining: number | null;
  endsAt: string | null;
  plans: Record<string, CampaignPlanPricing>;
}
