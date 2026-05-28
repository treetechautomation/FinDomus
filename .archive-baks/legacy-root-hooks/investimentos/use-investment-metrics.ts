import { useMemo } from 'react';

export function useInvestmentMetrics({
  investments,
  normalizeInvestment,
  filter,
  search,
  getTypeLabel,
  classes,
  colors,
}: any) {
  const assets = useMemo(
    () => investments.map(normalizeInvestment),
    [investments, normalizeInvestment]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((item: any) => {
      const matchFilter =
        filter === 'Todos' ||
        getTypeLabel(item.type) === filter;

      const q = search.trim().toLowerCase();

      const matchSearch =
        !q ||
        String(item.ticker || '').toLowerCase().includes(q) ||
        getTypeLabel(item.type).toLowerCase().includes(q) ||
        String(item.institution || '').toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [assets, filter, search, getTypeLabel]);

  const total = useMemo(
    () => assets.reduce((sum: number, item: any) => sum + item.currentValue, 0),
    [assets]
  );

  const invested = useMemo(
    () => assets.reduce((sum: number, item: any) => sum + item.investedAmount, 0),
    [assets]
  );

  const profit = total - invested;

  const profitPercent =
    invested > 0
      ? (profit / invested) * 100
      : 0;

  const distribution = useMemo(() => {
    return classes
      .filter((c: string) => c !== 'Todos')
      .map((type: string, index: number) => {
        const value = assets
          .filter((item: any) => getTypeLabel(item.type) === type)
          .reduce((sum: number, item: any) => sum + item.currentValue, 0);

        return {
          name: type,
          value,
          color: colors[index % colors.length],
          percent: total > 0 ? (value / total) * 100 : 0,
        };
      });
  }, [assets, classes, colors, total, getTypeLabel]);

  return {
    assets,
    filteredAssets,
    total,
    invested,
    profit,
    profitPercent,
    distribution,
  };
}
