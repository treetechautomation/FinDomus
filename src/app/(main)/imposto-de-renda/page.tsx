import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Upload, Paperclip, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const taxableIncome = [
    { source: 'Salário Empresa A', value: 85000 },
    { source: 'Pró-labore Empresa B', value: 60000 },
    { source: 'Aluguel Recebido', value: 12000 },
];

const deductibleExpenses = [
    { type: 'Saúde', description: 'Plano de Saúde', value: 6000 },
    { type: 'Educação', description: 'Pós-Graduação', value: 12000 },
];

export default function ImpostoDeRendaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Módulo Imposto de Renda
          </h1>
          <p className="text-muted-foreground mt-1">Organize sua declaração anual.</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Importar Informe
        </Button>
      </div>

      <Tabs defaultValue="rendimentos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="rendimentos">Rendimentos</TabsTrigger>
          <TabsTrigger value="despesas">Despesas Dedutíveis</TabsTrigger>
          <TabsTrigger value="bens">Bens e Direitos</TabsTrigger>
          <TabsTrigger value="dividas">Dívidas e Ônus</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rendimentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimentos Tributáveis</CardTitle>
              <CardDescription>Valores recebidos que compõem a base de cálculo do imposto.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fonte Pagadora</TableHead>
                    <TableHead className="text-right">Valor Anual (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxableIncome.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.source}</TableCell>
                      <TableCell className="text-right font-mono">{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Rendimento</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="despesas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Despesas Dedutíveis</CardTitle>
              <CardDescription>Gastos que podem reduzir a base de cálculo do imposto.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor Anual (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductibleExpenses.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right font-mono">{item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="outline" className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Documentos Anexados</CardTitle>
                    <CardDescription>Comprovantes e informes de rendimento.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Paperclip className="w-5 h-5 text-muted-foreground"/>
                                <p>Informe_Rendimentos_Empresa_A.pdf</p>
                            </div>
                            <Button variant="ghost" size="icon">
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                         <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <Paperclip className="w-5 h-5 text-muted-foreground"/>
                                <p>Recibos_Medicos_2024.zip</p>
                            </div>
                            <Button variant="ghost" size="icon">
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                    <Button variant="outline" className="mt-4"><Upload className="mr-2 h-4 w-4" /> Anexar Documento</Button>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
