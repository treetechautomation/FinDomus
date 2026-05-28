export function normalizeTransactionDate(input?: string) {
  if (!input) {
    const now = new Date();
    const iso = now.toISOString().slice(0, 10);

    return {
      date: now.toLocaleDateString('pt-BR'),
      dateISO: iso,
      monthKey: iso.slice(0, 7),
    };
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return {
      date: new Date(input).toLocaleDateString('pt-BR'),
      dateISO: input,
      monthKey: input.slice(0, 7),
    };
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(input)) {
    const [dd, mm, yyyy] = input.split('/');

    const iso = `${yyyy}-${mm}-${dd}`;

    return {
      date: input,
      dateISO: iso,
      monthKey: iso.slice(0, 7),
    };
  }

  // fallback Date()
  const parsed = new Date(input);

  if (!Number.isNaN(parsed.getTime())) {
    const iso = parsed.toISOString().slice(0, 10);

    return {
      date: parsed.toLocaleDateString('pt-BR'),
      dateISO: iso,
      monthKey: iso.slice(0, 7),
    };
  }

  return {
    date: input,
    dateISO: '',
    monthKey: '',
  };
}
