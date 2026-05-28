'use client';

import { useEffect, useState } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Card } from '@/components/ui/card';

function getMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

export function AIUsagePanel({ userId }: { userId: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const ref = doc(db, 'ai_usage', `${userId}_${getMonthKey()}`);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setData(snap.data());
      }
    }

    load();
  }, [userId]);

  if (!data) {
    return <div className="text-muted-foreground">Sem uso de IA neste mês</div>;
  }

  const percent = Math.round((data.calls / data.limit) * 100);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Chamadas usadas</div>
        <div className="text-2xl font-bold">{data.calls}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Limite mensal</div>
        <div className="text-2xl font-bold">{data.limit}</div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Uso</div>
        <div className="text-2xl font-bold">{percent}%</div>
      </Card>

      <div className="w-full bg-gray-200 rounded h-3">
        <div
          className="bg-blue-500 h-3 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
