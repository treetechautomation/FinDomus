import { Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InvestmentQuestionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Perguntas</h2>
        <p className="text-muted-foreground">
          Critérios usados para gerar nota e qualidade dos ativos da carteira.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Perguntas</CardTitle>
          <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
            Adicionar pergunta
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-yellow-500/80 text-black">
                <th className="p-3 text-left">Critério</th>
                <th className="p-3 text-left">Pergunta</th>
                <th className="p-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ROE', 'ROE historicamente maior que 5%?'],
                ['DIVIDENDOS', 'A empresa tem histórico de pagamento de dividendos?'],
                ['VANTAGEM COMPETITIVA', 'É líder no setor em que atua?'],
              ].map(([criteria, question]) => (
                <tr key={criteria} className="border-b border-white/10">
                  <td className="p-3 font-bold">{criteria}</td>
                  <td className="p-3">{question}</td>
                  <td className="p-3 text-center">
                    <Button size="sm" className="bg-yellow-500 text-black hover:bg-yellow-400">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
