'use client';

import { useEffect, useState, useRef } from 'react';
import type { KernelResult } from '@/core/finance/kernel';
import { InsightCard, ActionCard } from '@/components/mobile';
import type { FinancialAIInsight } from '@/core/finance/financial-ai-engine';
import type { ActionPlanItem } from '@/core/finance/freedom-engine';
import { getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { SendHorizonal, Loader2, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function mapSeverity(
  type: string
): 'info' | 'success' | 'warning' | 'negative' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'negative'> = {
    recurrence: 'negative',
    subscription: 'info',
    forecast: 'success',
    alert: 'warning',
    behavior: 'info',
  };
  return map[type] ?? 'info';
}

export interface MobileDomusViewProps {
  kernel: KernelResult | null;
  loading: boolean;
}

export function MobileDomusView({ kernel, loading: isLoading }: MobileDomusViewProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou a Domus, sua consultora financeira. Pergunte sobre seus investimentos, dívidas, orçamento ou planejamento.',
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const insights = (kernel?.ai?.insights as FinancialAIInsight[] | undefined) || [];
  const actions = (kernel?.freedom?.actions as ActionPlanItem[] | undefined) || [];

  const handleSendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const token = await getIdToken(auth.currentUser!);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao consultar a Domus');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.answer || 'Não consegui processar sua pergunta.',
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Erro: ${err.message || 'Falha na comunicação com a Domus.'}`,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="flex flex-col gap-fd-4 pb-fd-4"
      role="main"
      aria-label="Domus IA"
    >
      {/* ─── Page Title ──────────────────────────────────────────── */}
      <div className="pt-fd-3">
        <h1
          className="fd-heading-1"
          style={{ color: 'var(--fd-color-text-primary)' }}
        >
          Domus IA
        </h1>
        <p
          className="fd-body mt-fd-1"
          style={{ color: 'var(--fd-color-text-secondary)' }}
        >
          Sua inteligência financeira pessoal
        </p>
      </div>

      {/* ─── Chat ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-fd-2">
        <span
          className="fd-caption"
          style={{ color: 'var(--fd-color-text-secondary)' }}
        >
          Chat
        </span>

        <div
          className="flex flex-col gap-fd-2 max-h-[300px] overflow-y-auto"
          role="log"
          aria-label="Conversa com a Domus"
        >
          {chatMessages.map((msg, i) => (
            <div
              key={`${msg.timestamp}-${i}`}
              className={`flex gap-fd-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="flex items-center justify-center shrink-0 rounded-fd-sm"
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'var(--fd-color-action-primary-soft)',
                    color: 'var(--fd-color-action-primary)',
                  }}
                  aria-hidden="true"
                >
                  <Bot size={14} />
                </div>
              )}
              <div
                className="fd-body px-fd-3 py-fd-2 max-w-[80%] whitespace-pre-wrap"
                style={{
                  backgroundColor:
                    msg.role === 'user'
                      ? 'var(--fd-color-action-primary-soft)'
                      : 'var(--fd-color-surface-raised)',
                  color: 'var(--fd-color-text-primary)',
                  borderRadius: msg.role === 'user'
                    ? 'var(--fd-radius-md) var(--fd-radius-md) 0 var(--fd-radius-md)'
                    : 'var(--fd-radius-md) var(--fd-radius-md) var(--fd-radius-md) 0',
                  border: '1px solid var(--fd-color-border-default)',
                }}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div
                  className="flex items-center justify-center shrink-0 rounded-fd-sm"
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'var(--fd-color-surface-raised)',
                    color: 'var(--fd-color-text-secondary)',
                  }}
                  aria-hidden="true"
                >
                  <User size={14} />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-fd-2">
          <div
            className="fd-surface-raised flex items-center gap-fd-2 px-fd-3 flex-1"
            style={{
              border: '1px solid var(--fd-color-border-default)',
              borderRadius: 'var(--fd-radius-control)',
            }}
          >
            <span
              className="shrink-0 flex items-center justify-center"
              style={{ color: 'var(--fd-color-text-tertiary)' }}
              aria-hidden="true"
            >
              {chatLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Bot size={16} />
              )}
            </span>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte sobre suas finanças..."
              autoComplete="off"
              className="flex-1 bg-transparent border-none outline-none fd-body"
              style={{
                color: 'var(--fd-color-text-primary)',
                minHeight: '44px',
                caretColor: 'var(--fd-color-action-primary)',
              }}
              aria-label="Mensagem para Domus"
            />
          </div>
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={chatLoading || !chatInput.trim()}
            aria-label="Enviar mensagem"
            className="flex items-center justify-center shrink-0 rounded-fd-control"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'var(--fd-color-action-primary)',
              color: '#FFFFFF',
              opacity: chatLoading || !chatInput.trim() ? 0.5 : 1,
            }}
          >
            {chatLoading ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <SendHorizonal size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ─── Insights ────────────────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="flex flex-col gap-fd-2">
          <span
            className="fd-caption"
            style={{ color: 'var(--fd-color-text-secondary)' }}
          >
            Insights detectados
          </span>
          <div className="flex flex-col gap-fd-1">
            {insights.map((insight, i) => (
              <InsightCard
                key={`insight-${i}`}
                title={insight.title}
                description={insight.description}
                severity={mapSeverity(insight.type)}
                className="rounded-fd-md"
                loading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Plano de Ação ──────────────────────────────────────── */}
      {actions.length > 0 && (
        <div className="flex flex-col gap-fd-2">
          <span
            className="fd-caption"
            style={{ color: 'var(--fd-color-text-secondary)' }}
          >
            Plano de ação
          </span>
          <div className="flex flex-col gap-fd-1">
            {actions.slice(0, 5).map((action, i) => (
              <ActionCard
                key={`action-${i}`}
                title={action.title}
                description={action.description}
                primaryLabel={action.cta}
                onPrimaryClick={() => {
                  setChatInput(action.cta);
                }}
                className="rounded-fd-md"
                loading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Empty State ─────────────────────────────────────────── */}
      {!isLoading && insights.length === 0 && actions.length === 0 && (
        <div
          className="fd-surface-raised p-fd-4 text-center"
          role="status"
        >
          <p
            className="fd-body"
            style={{ color: 'var(--fd-color-text-tertiary)' }}
          >
            Nenhum insight ou plano de ação disponível. Importe transações para ativar a análise da Domus.
          </p>
        </div>
      )}
    </div>
  );
}
