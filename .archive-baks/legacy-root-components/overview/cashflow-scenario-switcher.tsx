'use client';

import { useState } from 'react';
import { CashflowChart } from './cashflow-chart';

export function CashflowScenarioSwitcher({ scenarios }: any) {
  const [scenario, setScenario] = useState<'atual' | 'semDividas' | 'comEntrada'>('atual');

  return (
    <div className="space-y-3">

      <div className="flex gap-2">
        <button onClick={() => setScenario('atual')} className="px-2 py-1 text-xs border rounded">
          Atual
        </button>
        <button onClick={() => setScenario('semDividas')} className="px-2 py-1 text-xs border rounded">
          Sem dívidas
        </button>
        <button onClick={() => setScenario('comEntrada')} className="px-2 py-1 text-xs border rounded">
          + Entrada
        </button>
      </div>

      <CashflowChart data={scenarios[scenario].items} />

    </div>
  );
}
