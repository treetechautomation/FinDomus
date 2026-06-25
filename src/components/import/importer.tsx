'use client';

import { getCurrentMonthKey } from '@/core/finance/financial-period-engine';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, FileText, X, 
  Loader2, Lock, ShieldCheck, ChevronRight, RotateCcw,
  TrendingUp, Building2, Wallet
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ImportReviewTable } from '@/components/import/review/import-review-table';
import { useAuth } from '@/providers/auth-provider';
import { auth } from '@/lib/firebase';

import { parseOFX } from "@/core/finance/ofx-parser";
import { parseNubankCSV } from '@/core/finance/invoice-parser';
import { handleFileExtract } from '@/lib/actions';
import { addTransactionsBatch } from '@/services/firestore/transactions';
import { buildImportPreview } from '@/core/imports/build-import-preview';
import { getCompanies } from '@/services/firestore/accounts';

// ─── Staging Persistence ────────────────────────────────────────────────────
const STAGING_KEY = 'findomus:import_staging';
const STAGING_TTL_MS = 60 * 60 * 1000; // 1 hora

type ImportStagingData = {
  step: 'config' | 'review';
  transactions: any[];
  owner: 'PF' | 'PJ';
  competenceMonth: string;
  importName: string;
  companyId: string;
  fileName: string;
  savedAt: string;
};

function loadStaging(): ImportStagingData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STAGING_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ImportStagingData;
    if (Date.now() - new Date(data.savedAt).getTime() > STAGING_TTL_MS) {
      sessionStorage.removeItem(STAGING_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function saveStaging(data: ImportStagingData) {
  if (typeof window === 'undefined') return;
  try { sessionStorage.setItem(STAGING_KEY, JSON.stringify(data)); } catch { /* quota exceeded — fail silently */ }
}

function clearStaging() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(STAGING_KEY); } catch {}
}
// ────────────────────────────────────────────────────────────────────────────


export function Importer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSource, setActiveSource] = useState<'financeiro' | 'b3' | 'corretoras' | 'cripto'>('financeiro');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pdfNeedsPassword, setPdfNeedsPassword] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'config' | 'review'>('upload');
  const [restoredStaging, setRestoredStaging] = useState<ImportStagingData | null>(null);

  const [owner, setOwner] = useState<'PF' | 'PJ'>('PF');

  const [competenceMonth, setCompetenceMonth] = useState(
    getCurrentMonthKey()
  );

  const [companies, setCompanies] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [importName, setImportName] = useState("");

  // Restaura staging da sessão anterior ao montar o componente
  useEffect(() => {
    const staging = loadStaging();
    if (staging && staging.transactions.length > 0) {
      setRestoredStaging(staging);
    }
  }, []);

  // Persiste staging sempre que o estado relevante muda (após processamento)
  useEffect(() => {
    if (transactions.length > 0 && step !== 'upload') {
      saveStaging({
        step: step as 'config' | 'review',
        transactions,
        owner,
        competenceMonth,
        importName,
        companyId,
        fileName: file?.name ?? '',
        savedAt: new Date().toISOString(),
      });
    }
  }, [transactions, step, owner, competenceMonth, importName, companyId, file]);

  useEffect(() => {
    async function loadCompanies() {
      if (!user?.uid) return;
      try {
        const data = await getCompanies(user.uid);
        setCompanies(data || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadCompanies();
  }, [user?.uid]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setPdfNeedsPassword(false);
      setPdfPassword('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/octet-stream': ['.ofx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const clearImport = () => {
    clearStaging(); // limpa sessionStorage
    setFile(null);
    setTransactions([]);
    setPdfPassword('');
    setPdfNeedsPassword(false);
    setStep('upload');
    setIsProcessing(false);
    setRestoredStaging(null);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      let extractedTransactions: any[] = [];

      if (file.type === 'application/pdf') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user?.uid || '');
        if (pdfPassword) formData.append('password', pdfPassword);

        const response = await fetch('/api/import/pdf', {
          method: 'POST',
          body: formData
        });

        if (response.status === 423) {
          setPdfNeedsPassword(true);
          setIsProcessing(false);
          toast({
            title: "PDF Protegido",
            description: "Este arquivo exige uma senha para ser lido.",
            variant: "destructive"
          });
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao processar PDF');
        }

        const data = await response.json();
        extractedTransactions = Array.isArray(data.transactions) ? data.transactions : [];

        if (extractedTransactions.length === 0) {
          const reader = new FileReader();
          const dataUri = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          const idToken = await auth.currentUser?.getIdToken();
          const aiResult = await handleFileExtract(dataUri, idToken);
          if (aiResult.success && aiResult.data) {
            extractedTransactions = aiResult.data.map(tx => ({
              date: tx.date,
              description: tx.description,
              amount: tx.value,
              category: tx.suggestedCategory,
              type: tx.transactionType,
              merchant: tx.source
            }));
          }
        }
        } else if (file.type.includes("image")) {
          const reader = new FileReader();
          const dataUri = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });

          const idToken = await auth.currentUser?.getIdToken();
          const aiResult = await handleFileExtract(dataUri, idToken);
          if (aiResult.success && aiResult.data) {
            extractedTransactions = aiResult.data.map(tx => ({
              date: tx.date,
              description: tx.description,
              amount: tx.value,
              category: tx.suggestedCategory,
              type: tx.transactionType,
              merchant: tx.source
            }));
          }
          } else if (
            file.name.toLowerCase().endsWith(".ofx") ||
            file.type === "application/octet-stream"
          ) {
            const text = await file.text();
            extractedTransactions = await parseOFX(text, user?.uid);

          } else if (
            file.name.toLowerCase().endsWith(".csv") ||
            file.type === "text/csv"
          ) {
            const text = await file.text();
            extractedTransactions = await parseNubankCSV(text, user?.uid);

          } else {
            toast({
              title: "Formato ainda não suportado",
              description: "No momento, use PDF, imagem, OFX ou CSV.",
              variant: "destructive"
            });
            setIsProcessing(false);
            return;
          }

        if (extractedTransactions.length > 0) {
          const preview = buildImportPreview(extractedTransactions);
          console.log("===== IMPORT PREVIEW =====", preview);
          setTransactions(extractedTransactions);
          setStep('config');
      } else {
        toast({
          title: "Nenhum lançamento encontrado",
          description: "Não conseguimos extrair dados deste arquivo. Verifique se o formato é suportado ou use CSV/OFX quando disponível.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmImport = async (decisions?: Record<string, 'accepted' | 'ignored'>) => {
    if (!user?.uid) {
      toast({
        title: "Erro na autenticação",
        description: "Você precisa estar logado para realizar importações.",
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);

    try {
      const importSessionId = crypto.randomUUID();
      const preview = buildImportPreview(transactions);

      const payload = preview.rows.map(row => {
        const t = row.transaction;
        let transferPairId = undefined;
        let transferConfidence = undefined;
        let transferReviewStatus = undefined;
        let transferReviewedAt = undefined;

        if (row.suggestedTransferPairId && decisions?.[row.suggestedTransferPairId] === 'accepted') {
          transferPairId = row.suggestedTransferPairId;
          transferConfidence = row.suggestedTransferConfidence;
          transferReviewStatus = 'accepted';
          transferReviewedAt = new Date().toISOString();
        }

        const data: any = {
          ...t,
          owner,
          companyId: owner === "PJ" ? companyId : null,
          competenceMonthKey: competenceMonth,
          importSessionId,
          importSessionName: importName || file?.name || "Importação sem nome",
          financialSource: importName || file?.name || "Importação sem nome",
          financialSourceType: file?.name?.toLowerCase().includes("fatura") ? "credit_card" : "checking_account",
        };

        if (transferPairId) {
          data.transferPairId = transferPairId;
          data.transferConfidence = transferConfidence;
          data.transferReviewStatus = transferReviewStatus;
          data.transferReviewedAt = transferReviewedAt;
        }

        return data;
      });

      const summary = await addTransactionsBatch(user.uid, payload);

      toast({
        title: "Importação concluída",
        description: `${summary.inserted} lançamentos importados com sucesso. ${summary.skipped} duplicados pulados.`,
      });

      clearStaging(); // limpa sessionStorage após sucesso
      clearImport();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os lançamentos no banco de dados.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };


  if (step === "config") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurar Importação</CardTitle>
          <CardDescription>
            Defina a competência financeira e o tipo da fatura antes da importação.
          </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Competência Financeira</Label>
              <Input
                type="month"
                value={competenceMonth}
                onChange={(e) => setCompetenceMonth(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nome da Importação</Label>
              <Input
                value={importName}
                onChange={(e) => setImportName(e.target.value)}
                placeholder="Ex: Fatura BTG Abril 2026"
              />
          </div>

          <div className="space-y-2">
            <Label>Tipo da Fatura</Label>

            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value as "PF" | "PJ")}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="PF">Pessoa Física (PF)</option>
              <option value="PJ">Pessoa Jurídica (PJ)</option>
            </select>
          </div>

          {owner === "PJ" && (
            <div className="space-y-2">
              <Label>Empresa</Label>

              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Selecione a empresa</option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={clearImport}
            >
              Cancelar
            </Button>

            <Button
              onClick={() => setStep("review")}
                disabled={(owner === "PJ" && !companyId) || !importName.trim()}
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }


  if (step === 'review') {
    return (
      <ImportReviewTable
        transactions={transactions}
        isProcessing={isProcessing}
        clearImport={clearImport}
        confirmImport={confirmImport}

        owner={owner}
        setOwner={setOwner}

        competenceMonth={competenceMonth}
        setCompetenceMonth={setCompetenceMonth}

        companies={companies}
        companyId={companyId}
        setCompanyId={setCompanyId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="financeiro" value={activeSource} onValueChange={(val) => setActiveSource(val as any)} className="w-full">
        <TabsList className="bg-slate-900/60 border border-white/5 grid w-full grid-cols-2 md:grid-cols-4 p-1 h-auto rounded-xl">
          <TabsTrigger value="financeiro" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="b3" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex items-center justify-center gap-1.5">
            Carteira B3 <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] px-1 py-0 h-4">Breve</Badge>
          </TabsTrigger>
          <TabsTrigger value="corretoras" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Corretoras
          </TabsTrigger>
          <TabsTrigger value="cripto" className="rounded-lg py-2.5 text-xs font-semibold data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Cripto / Futuro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-6 mt-6 animate-in fade-in duration-300">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-primary/20 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload de Documento
                </CardTitle>
                <CardDescription>
                  Arraste seu extrato bancário ou fatura de cartão.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Banner de restauração de staging */}
                {restoredStaging && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-sm">
                    <RotateCcw className="h-4 w-4 text-amber-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-amber-500">Importação anterior salva</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {restoredStaging.fileName || 'Arquivo desconhecido'} — {restoredStaging.transactions.length} transações
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => {
                          setTransactions(restoredStaging.transactions);
                          setOwner(restoredStaging.owner);
                          setCompetenceMonth(restoredStaging.competenceMonth);
                          setImportName(restoredStaging.importName);
                          setCompanyId(restoredStaging.companyId);
                          setStep(restoredStaging.step);
                          setRestoredStaging(null);
                        }}
                      >
                        Continuar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-7"
                        onClick={() => { clearStaging(); setRestoredStaging(null); }}
                      >
                        Descartar
                      </Button>
                    </div>
                  </div>
                )}
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-secondary rounded-full">
                      {file ? <FileText className="h-8 w-8 text-primary" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    {file ? (
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">
                          {isDragActive ? 'Solte o arquivo aqui' : 'Arraste e solte o arquivo aqui'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Suporta PDF, CSV, OFX, XLS, XLSX, PNG e JPG
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {pdfNeedsPassword && (
                  <div className="space-y-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <Lock className="h-4 w-4" />
                      <Label htmlFor="pdf-pass" className="font-bold">PDF Protegido</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Este arquivo exige senha para ser lido (geralmente o CPF do titular).
                    </p>
                    <div className="flex gap-2">
                      <Input 
                        id="pdf-pass"
                        type="password" 
                        placeholder="Digite a senha do PDF" 
                        value={pdfPassword}
                        onChange={(e) => setPdfPassword(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>
                )}

                {file && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={processFile} 
                      disabled={isProcessing || (pdfNeedsPassword && !pdfPassword)}
                    >
                      {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                      {pdfNeedsPassword ? 'Tentar com Senha' : 'Processar Arquivo'}
                    </Button>
                    <Button variant="outline" onClick={clearImport} disabled={isProcessing}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Privacidade Garantida</AlertTitle>
                <AlertDescription>
                  Seus arquivos são processados em ambiente seguro. Senhas de PDF nunca são armazenadas e os arquivos temporários são apagados imediatamente após a leitura.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Dicas de Importação</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>• <strong>Bancos Suportados:</strong> Nubank, Itaú, Bradesco, Santander, BTG e Inter.</p>
                  <p>• <strong>Formato Ideal:</strong> Dê preferência a PDFs de extratos mensais ou arquivos OFX/CSV diretos do Internet Banking.</p>
                  <p>• <strong>Faturas:</strong> Se enviar imagem da fatura, garanta que a foto esteja nítida e bem iluminada.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="b3" className="mt-6 animate-in fade-in duration-300">
          <Card className="border-amber-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
            <CardHeader>
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <TrendingUp className="h-6 w-6" />
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Em Homologação</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Importação B3 em preparação</CardTitle>
              <CardDescription>
                Carregue sua carteira de investimentos diretamente com relatórios da Área do Investidor B3.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-300">Aqui você poderá importar:</h4>
                <ul className="text-sm text-zinc-400 space-y-2 pl-4 list-disc">
                  <li>Posição de custódia consolidada</li>
                  <li>Extrato de movimentações históricas (compras e vendas)</li>
                  <li>Dividendos, JCP e proventos recebidos/provisionados</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-zinc-300">Formatos previstos:</h4>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300">CSV B3</Badge>
                  <Badge variant="outline" className="border-white/10 bg-white/5 text-zinc-300">PDF B3</Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button disabled className="w-full md:w-auto bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Importar Carteira B3 em breve
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="corretoras" className="mt-6 animate-in fade-in duration-300">
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Building2 className="h-6 w-6" />
                <Badge className="bg-white/5 text-zinc-400 border-white/10">Integração Futura</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Importação via Corretoras</CardTitle>
              <CardDescription>
                Integração automatizada ou por arquivos com XP, BTG, Rico, Inter e outras corretoras nacionais.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <p className="text-sm text-zinc-400">
                Esta funcionalidade está programada para sprints futuras do roadmap do FinDomus.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cripto" className="mt-6 animate-in fade-in duration-300">
          <Card className="border-white/10 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Wallet className="h-6 w-6" />
                <Badge className="bg-white/5 text-zinc-400 border-white/10">Integração Futura</Badge>
              </div>
              <CardTitle className="text-xl font-bold">Criptomoedas e Ativos Globais</CardTitle>
              <CardDescription>
                Importação de carteira cripto, extratos de exchanges (Binance, Mercado Bitcoin) e contratos futuros.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6">
              <p className="text-sm text-zinc-400">
                Esta funcionalidade está programada para sprints futuras do roadmap do FinDomus.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
