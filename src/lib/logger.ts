type LogLevel = 'info' | 'warn' | 'error' | 'audit' | 'security';

interface LogEntry {
  level: LogLevel;
  event: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const SANITIZED_FIELDS = [
  'balance', 'amount', 'value', 'saldo', 'patrimonio', 'netWorth',
  'cpf', 'cnpj', 'description', 'descricao', 'merchant',
  'bankName', 'bank', 'instituicao', 'institution',
  'transaction', 'extrato', 'accountNumber',
];

function sanitize(metadata?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!metadata) return undefined;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const lower = key.toLowerCase();
    if (SANITIZED_FIELDS.some((f) => lower.includes(f))) {
      safe[key] = '[REDACTED]';
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

function createEntry(level: LogLevel, event: string, userId?: string, metadata?: Record<string, unknown>): LogEntry {
  return {
    level,
    event,
    userId,
    metadata: sanitize(metadata),
    timestamp: new Date().toISOString(),
  };
}

function write(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}]`;
  const user = entry.userId ? ` [user:${entry.userId.slice(0, 8)}]` : '';
  const meta = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';

  switch (entry.level) {
    case 'error':
      console.error(`${prefix}${user} ${entry.event}${meta}`);
      break;
    case 'warn':
      console.warn(`${prefix}${user} ${entry.event}${meta}`);
      break;
    case 'audit':
      console.info(`${prefix}${user} ${entry.event}${meta}`);
      break;
    case 'security':
      console.warn(`${prefix}${user} ${entry.event}${meta}`);
      break;
    default:
      if (process.env.NODE_ENV === 'development') {
        console.log(`${prefix}${user} ${entry.event}${meta}`);
      }
  }
}

export const logger = {
  info(event: string, userId?: string, metadata?: Record<string, unknown>): void {
    write(createEntry('info', event, userId, metadata));
  },
  warn(event: string, userId?: string, metadata?: Record<string, unknown>): void {
    write(createEntry('warn', event, userId, metadata));
  },
  error(event: string, userId?: string, metadata?: Record<string, unknown>): void {
    write(createEntry('error', event, userId, metadata));
  },
  audit(event: string, userId?: string, metadata?: Record<string, unknown>): void {
    write(createEntry('audit', event, userId, metadata));
  },
  security(event: string, userId?: string, metadata?: Record<string, unknown>): void {
    write(createEntry('security', event, userId, metadata));
  },
};

export type { LogLevel, LogEntry };
