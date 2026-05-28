import { useMemo } from 'react';

export function useInvestmentAporte({
  aporteValue,
  total,
  goals,
  distribution,
}: any) {
  const aporteNumber = useMemo(() => {
    return Number(
      String(aporteValue || '0')
        .replace(/[^0-9,.-]/g, '')
        .replace(',', '.')
    ) || 0;
  }, [aporteValue]);

  const distributionMap = useMemo(() => {
    return new Map<string, any>(
      distribution.map((item: any) => [item.name, item])
    );
  }, [distribution]);


  const aporteSuggestions = useMemo(() => {
    const totalAfterAporte = total + aporteNumber;

    return goals
      .map((goal: any) => {
        const current = distributionMap.get(goal.name);
        const currentValue = Number(current?.value || 0);
        const targetValue = totalAfterAporte * (goal.value / 100);
        const gap = Math.max(targetValue - currentValue, 0);

        return {
          name: goal.name,
          goalPercent: goal.value,
          currentPercent: total > 0 ? (currentValue / total) * 100 : 0,
          currentValue,
          targetValue,
          suggestedValue: gap,
        };
      })
      .filter((item: any) => item.suggestedValue > 0)
      .sort((a: any, b: any) => b.suggestedValue - a.suggestedValue);
  }, [aporteNumber, distributionMap, goals, total]);

  const aportePlan = useMemo(() => {
    const totalSuggestedGap = aporteSuggestions.reduce(
      (sum: number, item: any) => sum + item.suggestedValue,
      0
    );

    return goals.map((goal: any) => {
      const suggestion = aporteSuggestions.find((item: any) => item.name === goal.name);
      const proportionalValue =
        totalSuggestedGap > 0 && suggestion
          ? (suggestion.suggestedValue / totalSuggestedGap) * aporteNumber
          : aporteNumber * (goal.value / 100);

      return {
        name: goal.name,
        goalPercent: goal.value,
        currentPercent: distributionMap.get(goal.name)?.percent || 0,
        suggestedValue: Math.max(proportionalValue, 0),
      };
    });
  }, [aporteNumber, aporteSuggestions, distributionMap, goals]);

  return {
    aporteNumber,
    aporteSuggestions,
    aportePlan,
  };
}
