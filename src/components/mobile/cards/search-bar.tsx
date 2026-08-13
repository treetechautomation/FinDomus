'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showClear?: boolean;
  debounceMs?: number;
  loading?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  showClear = true,
  debounceMs,
  loading = false,
  autoFocus = false,
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const flushDebounced = useCallback((val: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
    onChangeRef.current(val);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setLocalValue(next);

      if (debounceMs !== undefined && debounceMs > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onChangeRef.current(next);
        }, debounceMs);
      } else {
        onChangeRef.current(next);
      }
    },
    [debounceMs]
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    flushDebounced('');
  }, [flushDebounced]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasValue = localValue.length > 0;

  return (
    <div
      className={cn(
        'fd-surface-raised flex items-center gap-fd-2 px-fd-3 h-11',
        className
      )}
      style={{
        border: '1px solid var(--fd-color-border-default)',
        borderRadius: 'var(--fd-radius-control)',
      }}
      role="search"
      aria-label={placeholder}
    >
      <span
        className="shrink-0 flex items-center justify-center"
        style={{ color: 'var(--fd-color-text-tertiary)' }}
        aria-hidden="true"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Search size={16} />
        )}
      </span>

      <input
        ref={inputRef}
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className={cn(
          'flex-1 bg-transparent border-none outline-none fd-body',
          'placeholder:text-fd-placeholder'
        )}
        style={{
          color: 'var(--fd-color-text-primary)',
          minHeight: '44px',
          caretColor: 'var(--fd-color-action-primary)',
        }}
        aria-label={placeholder}
      />

      {showClear && hasValue && !loading && (
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 flex items-center justify-center rounded-fd-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{
            color: 'var(--fd-color-text-tertiary)',
            outlineColor: 'var(--fd-color-action-focus)',
            minHeight: '44px',
            minWidth: '44px',
          }}
          aria-label="Limpar busca"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
