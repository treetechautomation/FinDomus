import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyBRL(v: number) {
  return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatCurrencyInput(value: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  // Convert number to string representing cents, or parse string
  let clean = '';
  if (typeof value === 'number') {
    clean = Math.round(value * 100).toString();
  } else {
    clean = value.replace(/\D/g, '');
  }
  if (!clean) return '';
  const num = Number(clean) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseCurrencyInput(value: string | number): number {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') return value;
  const clean = value.replace(/\D/g, '');
  return Number(clean) / 100;
}
