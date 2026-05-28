export function calculateRetirement({
  currentAmount,
  monthlyContribution,
  annualRate,
  years,
  targetAmount,
}: {
  currentAmount: number;
  monthlyContribution: number;
  annualRate: number;
  years: number;
  targetAmount: number;
}) {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  const futureValue =
    monthlyRate > 0
      ? currentAmount * Math.pow(1 + monthlyRate, months) +
        monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : currentAmount + monthlyContribution * months;

  const requiredContribution =
    monthlyRate > 0
      ? (targetAmount - currentAmount * Math.pow(1 + monthlyRate, months)) /
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      : (targetAmount - currentAmount) / months;

  return {
    futureValue,
    requiredContribution: Math.max(requiredContribution, 0),
    gap: targetAmount - futureValue,
    willReach: futureValue >= targetAmount,
  };
}
