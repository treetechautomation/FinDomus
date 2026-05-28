import { Edit, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InvestmentQuestionsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-amber-100 bg-clip-text text-transparent">
          Perguntas
        </h2>
        <p className="text-muted-foreground">
          Critérios usados para gerar nota e qualidade dos ativos da carteira.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            Critérios de avaliação
          </CardTitle>
          <Button className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30">
            Adicionar pergunta
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20">
                <th className="p-4 text-left text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Critério</th>
                <th className="p-4 text-left text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Pergunta</th>
                <th className="p-4 text-center text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ROE', 'ROE historicamente maior que 5%?'],
                ['DIVIDENDOS', 'A empresa tem histórico de pagamento de dividendos?'],
                ['VANTAGEM COMPETITIVA', 'É líder no setor em que atua?'],
              ].map(([criteria, question]) => (
                <tr key={criteria} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150">
                  <td className="p-4 font-bold text-foreground">{criteria}</td>
                  <td className="p-4 text-muted-foreground">{question}</td>
                  <td className="p-4 text-center">
                    <Button size="sm" variant="ghost" className="text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/10">
                      <Edit className="mr-1 h-3 w-3" />
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
