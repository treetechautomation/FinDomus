import { ImportCenter } from "@/components/import/import-center";
import { Upload } from "lucide-react";

export default function ImportacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
          <Upload className="w-8 h-8 text-primary" />
          Central de Importação
        </h1>
        <p className="text-muted-foreground mt-1">
          Centralize suas importações financeiras, carteira B3 e integrações futuras em um só lugar.
        </p>
      </div>

      <ImportCenter />
    </div>
  );
}