import { Importer } from "@/components/import/importer";
import { Upload } from "lucide-react";

export default function ImportacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Upload className="w-8 h-8 text-primary" />
          Módulo de Importações
        </h1>
        <p className="text-muted-foreground mt-1">
          Envie faturas, extratos e comprovantes para extração automática de dados com IA.
        </p>
      </div>

      <Importer />
    </div>
  );
}