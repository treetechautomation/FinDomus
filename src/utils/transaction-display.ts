export interface TransactionDisplaySemantics {
  isRefund: boolean;
  label: string;
  sign: '+' | '-' | '';
  isPositiveEffect: boolean;
}

export function getTransactionDisplaySemantics(transaction: {
  type?: string;
  isRefund?: boolean;
} | null | undefined): TransactionDisplaySemantics {
  if (!transaction) {
    return {
      isRefund: false,
      label: 'Despesa',
      sign: '-',
      isPositiveEffect: false,
    };
  }

  // Defensive invariant: refund display strictly requires type === 'expense'
  const isRefund = transaction.type === 'expense' && transaction.isRefund === true;

  if (isRefund) {
    return {
      isRefund: true,
      label: 'Estorno',
      sign: '+',
      isPositiveEffect: true,
    };
  }

  if (transaction.type === 'income') {
    return {
      isRefund: false,
      label: 'Receita',
      sign: '+',
      isPositiveEffect: true,
    };
  }

  if (transaction.type === 'transfer') {
    return {
      isRefund: false,
      label: 'Transferência',
      sign: '',
      isPositiveEffect: false,
    };
  }

  // Default: normal expense
  return {
    isRefund: false,
    label: 'Despesa',
    sign: '-',
    isPositiveEffect: false,
  };
}

export function normalizeManualRefundState(type: string | undefined, requestedIsRefund: boolean): boolean {
  if (type !== 'expense') {
    return false;
  }
  return Boolean(requestedIsRefund);
}

export function isExistingInstallmentRefundBlocked(transaction: {
  isInstallment?: boolean;
  installmentKey?: string;
  installmentCurrent?: number | null;
  installmentTotal?: number | null;
  isRefund?: boolean;
} | null | undefined): boolean {
  if (!transaction) return false;
  const isInstallment = Boolean(
    transaction.isInstallment ||
    transaction.installmentKey ||
    (transaction.installmentCurrent && transaction.installmentTotal)
  );
  return isInstallment && transaction.isRefund !== true;
}

export function resolveManualRefundForEditSave(
  transaction: {
    type?: string;
    isInstallment?: boolean;
    installmentKey?: string;
    installmentCurrent?: number | null;
    installmentTotal?: number | null;
    isRefund?: boolean;
  } | null | undefined,
  requestedIsRefund: boolean
): boolean {
  if (!transaction) return false;
  const isInstallmentBlocked = isExistingInstallmentRefundBlocked(transaction);
  if (isInstallmentBlocked) {
    return false;
  }
  return normalizeManualRefundState(transaction.type, requestedIsRefund);
}

/**
 * Resolves the effective isRefund state in the import review flow.
 * Enforces:
 * 1. Only type === 'expense' can be a refund.
 * 2. If override is boolean, override wins.
 * 3. If override is undefined, originalIsRefund === true wins.
 */
export function resolveImportRefundOverride(
  type: string | undefined,
  originalIsRefund: boolean | undefined,
  override: boolean | undefined
): boolean {
  if (type !== 'expense') {
    return false;
  }
  if (override !== undefined) {
    return Boolean(override);
  }
  return Boolean(originalIsRefund);
}

export interface ImportReviewOverrideItem {
  category?: string;
  type?: string;
  isRefund?: boolean;
  ignored?: boolean;
  pendingLearning?: boolean;
}

/**
 * Applies review overrides to transactions for preview and confirmation.
 * Resolves effective category, type, and isRefund (using resolveImportRefundOverride),
 * and excludes ignored rows from the final payload.
 */
export function applyImportReviewOverrides(
  transactions: any[],
  overrides: Record<string, ImportReviewOverrideItem> = {},
  hashResolver?: (tx: any) => string
): any[] {
  return transactions
    .map((tx) => {
      const hash = tx.importHash || (hashResolver ? hashResolver(tx) : tx.id || '');
      const override = overrides[hash];
      const effectiveType = override?.type ?? tx.type;
      const effectiveIsRefund = resolveImportRefundOverride(
        effectiveType,
        tx.isRefund,
        override?.isRefund
      );

      if (override) {
        return {
          ...tx,
          importHash: hash,
          category: override.category ?? tx.category,
          type: effectiveType,
          isRefund: effectiveIsRefund,
          ignored: override.ignored,
        };
      }
      return { ...tx, importHash: hash, isRefund: effectiveIsRefund };
    })
    .filter((tx) => !tx.ignored);
}
