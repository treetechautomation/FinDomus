import { Importer } from "@/components/import/importer";

export default function ImportarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Importação de Faturas e Extratos</h1>
        <p className="text-muted-foreground">
          Envie um arquivo de fatura ou extrato para que nossa IA extraia as transações automaticamente.
        </p>
      </div>

      <Importer />
    </div>
  );
}
