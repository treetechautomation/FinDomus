"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy, FileText, Calendar, Download } from "lucide-react";
import { getTaxObligations } from "@/services/firestore/fiscal";
import { getCompanies } from "@/services/firestore/accounts";
import { useAuth } from "@/providers/auth-provider";
import { AddTaxObligationDialog } from "@/components/fiscal/add-tax-obligation-dialog";
import { TaxObligationsList } from "@/components/fiscal/tax-obligations-list";

export default function FiscalClient() {
  const { user } = useAuth();
  const [taxObligations, setTaxObligations] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiscalData() {
      if (!user?.uid) return;
      try {
        const [obligationsResult, companiesResult] = await Promise.all([
          getTaxObligations(),
          getCompanies(user.uid),
        ]);

        setTaxObligations(obligationsResult || []);
        setCompanies(companiesResult || []);
      } catch (error) {
        console.error('Erro ao carregar fiscal:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFiscalData();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Fiscal & Contábil
        </h1>

        <div className="rounded-xl border bg-card p-6 text-muted-foreground">
          Carregando módulo fiscal...
        </div>
      </div>
    );
  }

  const totalPending = taxObligations
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + Number(item.value || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookCopy className="w-8 h-8 text-primary" />
            Módulo Fiscal & Contábil
          </h1>
          <p className="text-muted-foreground mt-1">Central de obrigações e documentos fiscais.</p>
        </div>

        <AddTaxObligationDialog companies={companies} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              Calendário de Obrigações
            </CardTitle>
            <CardDescription>
              Pendências fiscais: {totalPending.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TaxObligationsList obligations={taxObligations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Documentos Fiscais
            </CardTitle>
            <CardDescription>Guias de impostos e outros documentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2"/>
              Guia DAS - Julho/2024
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2"/>
              Comprovante INSS - Julho/2024
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contador</CardTitle>
            <CardDescription>Informações e contato do seu contador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">Contabilidade Exemplo</p>
            <p className="text-sm text-muted-foreground">responsavel@contabilidade.com</p>
            <p className="text-sm text-muted-foreground">(11) 99999-8888</p>
            <Button className="w-full mt-2" asChild>
              <a href="mailto:responsavel@contabilidade.com">Entrar em contato</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
