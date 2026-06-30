import { useEffect, useState } from 'react';
import { runFinancialKernel, kernelCache, type KernelContext, type KernelResult } from '@/core/finance/kernel';
import { financialEvents } from '@/core/finance/events';

export function useFinancialKernel(context: KernelContext | null) {
  const [result, setResult] = useState<KernelResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!context) return;
    setLoading(true);
    try {
      const kernelResult = runFinancialKernel(context);
      setResult(kernelResult);
    } catch (err) {
      console.error('[useFinancialKernel] Error running financial kernel', err);
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    const handler = () => {
      if (!context) return;
      setLoading(true);
      try {
        kernelCache.invalidate(); // Invalidate in-memory cache on local events
        const kernelResult = runFinancialKernel(context);
        setResult(kernelResult);
      } catch (err) {
        console.error('[useFinancialKernel] Error re-running financial kernel on event', err);
      } finally {
        setLoading(false);
      }
    };

    financialEvents.on('data:changed', handler);
    return () => {
      financialEvents.off('data:changed', handler);
    };
  }, [context]);

  return { result, loading };
}
export type { KernelContext, KernelResult };
