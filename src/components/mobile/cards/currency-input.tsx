'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useId,
} from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyInput } from '@/lib/utils';

export interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  error?: string | boolean;
  helperText?: string;
  label?: string;
  id?: string;
  name?: string;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
}

function applyFormat(
  digits: string,
  isNegative: boolean
): { formatted: string; numeric: number } {
  const abs = digits ? Number(digits) / 100 : 0;
  const numeric = isNegative ? -abs : abs;
  const formattedAbs = formatCurrencyInput(abs);
  if (isNegative && abs === 0) {
    return { formatted: `-${formattedAbs}`, numeric };
  }
  return {
    formatted: isNegative ? `-${formattedAbs}` : formattedAbs,
    numeric,
  };
}

const CURRENCY_REGEX = /^[0-9]$/;

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(function CurrencyInput(
  {
    value,
    onChange,
    onBlur,
    placeholder = '0,00',
    prefix = 'R$',
    suffix,
    allowNegative = false,
    disabled = false,
    readOnly = false,
    loading = false,
    error,
    helperText,
    label,
    id: idProp,
    name,
    className,
    required = false,
    autoFocus = false,
  },
  ref
) {
  const generatedId = useId();
  const inputId = idProp ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const internalRef = useRef<HTMLInputElement | null>(null);
  const rawDigitsRef = useRef('');
  const isNegativeRef = useRef(false);
  const isFocusedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const displayValueRef = useRef('0,00');

  onChangeRef.current = onChange;

  const syncFromProps = useCallback((next: number) => {
    const nextAbs = Math.abs(next);
    isNegativeRef.current = allowNegative && next < 0;
    rawDigitsRef.current = nextAbs
      ? Math.round(nextAbs * 100).toString()
      : '';
    const { formatted } = applyFormat(
      rawDigitsRef.current,
      isNegativeRef.current
    );
    displayValueRef.current = formatted;
    return formatted;
  }, [allowNegative]);

  const [displayValue, setDisplayValue] = useState(() =>
    syncFromProps(value)
  );

  const flushToParent = useCallback(
    (digits: string, isNegative: boolean) => {
      const { formatted, numeric } = applyFormat(digits, isNegative);
      displayValueRef.current = formatted;
      rawDigitsRef.current = digits;
      isNegativeRef.current = isNegative;
      setDisplayValue(formatted);
      onChangeRef.current(numeric);
      requestAnimationFrame(() => {
        if (internalRef.current) {
          const pos = formatted.length;
          internalRef.current.setSelectionRange(pos, pos);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!isFocusedRef.current) {
      const next = syncFromProps(value);
      setDisplayValue(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (autoFocus && internalRef.current) {
      internalRef.current.focus();
    }
  }, [autoFocus]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const { key, ctrlKey, metaKey } = e;

      if (
        key === 'ArrowLeft' ||
        key === 'ArrowRight' ||
        key === 'ArrowUp' ||
        key === 'ArrowDown' ||
        key === 'Home' ||
        key === 'End' ||
        key === 'Tab' ||
        key === 'Escape'
      ) {
        return;
      }

      if ((ctrlKey || metaKey) && (key === 'a' || key === 'c' || key === 'v' || key === 'x')) {
        return;
      }

      if (CURRENCY_REGEX.test(key)) {
        e.preventDefault();

        const hasSelection =
          internalRef.current &&
          internalRef.current.selectionStart !==
            internalRef.current.selectionEnd;

        let digits = hasSelection ? '' : rawDigitsRef.current;
        digits += key;
        flushToParent(digits, isNegativeRef.current);
        return;
      }

      if (key === 'Backspace' || key === 'Delete') {
        e.preventDefault();
        const digits = rawDigitsRef.current.slice(0, -1) || '';
        flushToParent(digits, isNegativeRef.current);
        return;
      }

      if (key === '-' && allowNegative) {
        e.preventDefault();
        const wasNegative = isNegativeRef.current;
        flushToParent(rawDigitsRef.current, !wasNegative);
        return;
      }

      e.preventDefault();
    },
    [allowNegative, flushToParent]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain') ?? '';
      const digits = text.replace(/[^0-9]/g, '');
      const isNegative =
        allowNegative && text.trimStart().startsWith('-');
      flushToParent(digits, isNegative);
    },
    [allowNegative, flushToParent]
  );

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      isFocusedRef.current = false;
      onBlur?.(e);
    },
    [onBlur]
  );

  // ─── resolve forwarded ref + internal ref ─────────────────────────

  const resolvedRef = useCallback(
    (node: HTMLInputElement | null) => {
      internalRef.current = node;
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          node;
      }
    },
    [ref]
  );

  // ─── loading ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className={cn('flex flex-col gap-fd-1', className)}
        role="status"
        aria-label="Carregando campo monetário"
      >
        {label && (
          <Skeleton
            className="h-3 w-16 rounded-fd-sm"
            style={{ background: 'var(--fd-color-border-subtle)' }}
          />
        )}
        <Skeleton
          className="h-11 w-full rounded-fd-control"
          style={{ background: 'var(--fd-color-border-subtle)' }}
        />
      </div>
    );
  }

  // ─── render ───────────────────────────────────────────────────────

  const hasError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : undefined;
  const describedBy = [
    hasError && errorMessage ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-fd-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="fd-supporting"
          style={{ color: 'var(--fd-color-text-secondary)' }}
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              style={{ color: 'var(--fd-color-state-negative)' }}
            >
              {' '}
              *
            </span>
          )}
        </label>
      )}

      <div
        className={cn(
          'fd-surface-raised flex items-center gap-fd-1',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          border: `1px solid ${hasError ? 'var(--fd-color-state-negative)' : 'var(--fd-color-border-default)'}`,
          borderRadius: 'var(--fd-radius-control)',
          paddingLeft: 'var(--fd-space-3)',
          paddingRight: 'var(--fd-space-3)',
        }}
      >
        {prefix && (
          <span
            className="fd-body shrink-0 select-none"
            style={{ color: 'var(--fd-color-text-tertiary)' }}
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}

        <input
          ref={resolvedRef}
          id={inputId}
          name={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete="off"
          className={cn(
            'flex-1 bg-transparent border-none outline-none fd-body min-w-0',
            'placeholder:text-fd-placeholder'
          )}
          style={{
            color: hasError
              ? 'var(--fd-color-state-negative)'
              : 'var(--fd-color-text-primary)',
            caretColor: 'var(--fd-color-action-primary)',
            minHeight: '44px',
          }}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          aria-label={label ?? placeholder}
        />

        {suffix && (
          <span
            className="fd-body shrink-0 select-none"
            style={{ color: 'var(--fd-color-text-tertiary)' }}
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}
      </div>

      {hasError && errorMessage && (
        <p
          id={errorId}
          className="fd-caption"
          style={{ color: 'var(--fd-color-state-negative)' }}
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {helperText && !hasError && (
        <p
          id={helperId}
          className="fd-supporting"
          style={{ color: 'var(--fd-color-text-tertiary)' }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});
