import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Terminal } from "lucide-react";

export default function ConsolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary" />
          Console do Projeto
        </h1>
        <p className="text-muted-foreground mt-1">
          Interface para interação e depuração de serviços.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Terminal</CardTitle>
          <CardDescription>Execute comandos e veja os logs de saída.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
            <p className="text-muted-foreground">&gt; Console inicializado. Aguardando comandos...</p>
            {/* Log output will appear here */}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Digite um comando..." className="font-mono" />
            <Button>Executar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}