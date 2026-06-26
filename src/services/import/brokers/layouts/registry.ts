import { LayoutSchema } from './layout-types';
import { XpCustodyLayout } from './xp-custody';
import { XpLedgerLayout } from './xp-ledger';
import { BtgLedgerLayout } from './btg-ledger';

export const BROKER_LAYOUTS: LayoutSchema[] = [
  XpCustodyLayout,
  XpLedgerLayout,
  BtgLedgerLayout
];

export function getLayoutById(id: string): LayoutSchema | undefined {
  return BROKER_LAYOUTS.find(l => l.id === id);
}
