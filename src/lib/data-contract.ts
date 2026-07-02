export type SnapshotStatus = 'READY' | 'DIRTY' | 'BUILDING' | 'FAILED';
export type SnapshotHealth = 'GOOD' | 'STALE' | 'BUILDING' | 'FAILED' | 'EXPIRED';

export type DataClassification =
  | 'ULTRA_CRITICO'
  | 'CRITICO'
  | 'CONFIDENCIAL'
  | 'OPERACIONAL'
  | 'PUBLICO';

export interface DataContract {
  userId: string;
  domain: string;
  classification: DataClassification;

  schemaVersion: number;
  dataVersion: number;
  kernelVersion: number;

  status: SnapshotStatus;
  health: SnapshotHealth;

  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  buildTimeMs: number;

  lockAcquiredAt: string | null;

  metrics: {
    sourceReads: number;
    sourceWrites: number;
    cacheHits: number;
  };

  metadata: {
    triggeredBy: string[];
    previousVersion: number;
    featureFlags: string[];
  };
}

export const DATA_CLASSIFICATION_RULES: Record<DataClassification, {
  canCache: boolean;
  canBrowserStorage: boolean;
  canUseInAI: boolean;
}> = {
  ULTRA_CRITICO: { canCache: true, canBrowserStorage: false, canUseInAI: true },
  CRITICO:      { canCache: true, canBrowserStorage: false, canUseInAI: true },
  CONFIDENCIAL: { canCache: true, canBrowserStorage: false, canUseInAI: true },
  OPERACIONAL:  { canCache: true, canBrowserStorage: true,  canUseInAI: false },
  PUBLICO:      { canCache: true, canBrowserStorage: true,  canUseInAI: true },
};

export function isBrowserStorageAllowed(classification: DataClassification): boolean {
  return DATA_CLASSIFICATION_RULES[classification]?.canBrowserStorage ?? false;
}

export function createDataContract(
  userId: string,
  domain: string,
  classification: DataClassification,
  kernelVersion: number,
): DataContract {
  return {
    userId,
    domain,
    classification,
    schemaVersion: 1,
    dataVersion: 0,
    kernelVersion,
    status: 'DIRTY',
    health: 'STALE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: null,
    buildTimeMs: 0,
    lockAcquiredAt: null,
    metrics: { sourceReads: 0, sourceWrites: 0, cacheHits: 0 },
    metadata: { triggeredBy: [], previousVersion: 0, featureFlags: [] },
  };
}
