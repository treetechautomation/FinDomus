export interface LaunchOffer {
  totalSlots: number;
  usedSlots: number;
  remainingSlots: number;
  active: boolean;
}

const FALLBACK_OFFER: LaunchOffer = {
  totalSlots: 100,
  usedSlots: 0,
  remainingSlots: 100,
  active: true,
};

export async function getPublicLaunchOffer(): Promise<LaunchOffer> {
  try {
    const res = await fetch('/api/public/launch-offer', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return {
        totalSlots: data.totalSlots ?? 100,
        usedSlots: data.usedSlots ?? 0,
        remainingSlots: data.remainingSlots ?? 100,
        active: data.active ?? true,
      };
    }
  } catch (error) {
    console.error('Error calling public launch-offer API:', error);
  }
  return FALLBACK_OFFER;
}
