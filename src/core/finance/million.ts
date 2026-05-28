export function simulateCompound({
  initial = 0,
  monthly = 0,
  rate = 0.08,
  years = 10,
}: any) {
  const months = years * 12;
  const monthlyRate = rate / 12;

  let total = initial;

  for (let i = 0; i < months; i++) {
    total = total * (1 + monthlyRate) + monthly;
  }

  return total;
}

export function generateChartData({ initial, rate }: { initial: number; rate: number }) {
  const aportes = [50, 100, 200, 300, 400, 500, 1000];
  const anos = [10, 15, 20, 25, 30, 35, 40];

  return anos.map((ano) => {
    const row: any = { year: ano };

    for (const aporte of aportes) {
      let total = initial;
      const monthlyRate = rate / 12;

      for (let i = 0; i < ano * 12; i++) {
        total = total * (1 + monthlyRate) + aporte;
      }

      row[aporte] = total;
    }

    return row;
  });
}
