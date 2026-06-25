import { Importer } from "@/components/import/importer";

export default function ImportarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Central de Importação</h1>
        <p className="text-muted-foreground">
          Centralize suas importações financeiras, carteira B3 e integrações futuras em um só lugar.
        </p>
      </div>

      <Importer />
    </div>
  );
}
