export type FinancialEventType =
  | 'transaction:created'
  | 'transaction:deleted'
  | 'transaction:updated'
  | 'liability:created'
  | 'liability:updated'
  | 'liability:deleted'
  | 'investment:created'
  | 'investment:updated'
  | 'investment:deleted'
  | 'account:updated'
  | 'month:closed'
  | 'month:reopened'
  | 'planning:updated'
  | 'recurring:updated'
  | 'data:changed';

export type FinancialEvent = {
  type: FinancialEventType;
  payload?: any;
  timestamp: string;
  source: string;
};

type EventHandler = (event: FinancialEvent) => void | Promise<void>;

class FinancialEventBus {
  private handlers = new Map<FinancialEventType, Set<EventHandler>>();

  on(type: FinancialEventType, handler: EventHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: FinancialEventType, handler: EventHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  async emit(event: FinancialEvent) {
    // 1. Trigger specific event handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      await Promise.all([...handlers].map(async (h) => {
        try {
          await h(event);
        } catch (e) {
          console.error(`[FinancialEventBus] Error in specific handler for type: ${event.type}`, e);
        }
      }));
    }

    // 2. Proactively propagate as general 'data:changed' if not already data:changed
    if (event.type !== 'data:changed') {
      const changedHandlers = this.handlers.get('data:changed');
      if (changedHandlers) {
        const changedEvent: FinancialEvent = {
          type: 'data:changed',
          payload: { triggerEvent: event.type, originalPayload: event.payload },
          timestamp: event.timestamp,
          source: event.source,
        };
        await Promise.all([...changedHandlers].map(async (h) => {
          try {
            await h(changedEvent);
          } catch (e) {
            console.error('[FinancialEventBus] Error in data:changed handler', e);
          }
        }));
      }
    }
  }
}

export const financialEvents = new FinancialEventBus();
