'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Building2, Upload, AlertCircle, CheckCircle2, 
  FileText, X, Loader2, Lock, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { CorretorasPreview } from './corretoras-preview';
import type { NormalizedBrokerImport } from '@/services/import/brokers/broker-types';

export function CorretorasImporter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [pdfNeedsPassword, setPdfNeedsPassword] = useState(false);
  const [importResult, setImportResult] = useState<NormalizedBrokerImport | null>(null);

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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const clearImport = () => {
    setFile(null);
    setImportResult(null);
    setPdfPassword('');
    setPdfNeedsPassword(false);
    setIsProcessing(false);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (user?.uid) {
        formData.append('userId', user.uid);
      }
      if (pdfPassword) {
        formData.append('password', pdfPassword);
      }

      const response = await fetch('/api/import/brokers', {
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

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || 'Erro ao processar arquivo de corretora.');
      }

      if (json.success && json.data) {
        setImportResult(json.data);
        toast({
          title: "Arquivo Processado",
          description: `Documento da corretora ${json.data.metadata.source} lido com sucesso.`
        });
      } else {
        throw new Error('Resposta inválida do servidor.');
      }

    } catch (error: any) {
      toast({
        title: "Erro no processamento",
        description: error.message || "Não foi possível extrair os dados do arquivo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (importResult) {
    return <CorretorasPreview data={importResult} onClear={clearImport} />;
  }

  return (
    <Card className="border-indigo-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
      <CardHeader>
        <div className="flex items-center gap-2 text-indigo-400 mb-2">
          <Building2 className="h-6 w-6" />
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Em Homologação</Badge>
        </div>
        <CardTitle className="text-xl font-bold text-white">Importador de Corretoras (Preview)</CardTitle>
        <CardDescription className="text-zinc-400">
          Envie extratos de custódia, movimentações (XP/BTG) ou notas de corretagem padrão Sinacor para auditoria e preview.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300">Corretoras Suportadas nesta fase:</h4>
            <div className="flex flex-wrap gap-2">
              {['XP Investimentos', 'BTG Pactual', 'Rico', 'Clear', 'Inter'].map(broker => (
                <Badge key={broker} variant="outline" className="border-indigo-500/20 bg-indigo-500/5 text-indigo-300">
                  {broker}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-zinc-300">Formatos e Documentos Aceitos:</h4>
            <ul className="text-sm text-zinc-400 space-y-2 pl-4 list-disc marker:text-indigo-500/70">
              <li>Notas de negociação B3 (PDF padrão Sinacor)</li>
              <li>Posição de Custódia detalhada XP (XLSX)</li>
              <li>Histórico de Movimentação/Extrato XP (XLSX)</li>
              <li>Extrato de conta corrente / lançamentos BTG (XLSX/CSV)</li>
            </ul>
          </div>
        </div>

        <div className="bg-black/20 border border-white/5 p-4 rounded-lg space-y-3">
          <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Resultado do Processamento
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Extração de posições de custódia</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Detecção de proventos recebidos</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Operações de compra e venda</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" /> Sugestão de dedupeKey exclusivo</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-indigo-500 bg-indigo-500/10' 
                : 'border-white/10 hover:border-indigo-500/50 bg-black/20 hover:bg-black/35'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400">
                {file ? <FileText className="h-8 w-8 text-indigo-400" /> : <Upload className="h-8 w-8" />}
              </div>
              {file ? (
                <div>
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-zinc-200">
                    {isDragActive ? 'Solte o arquivo de corretora aqui' : 'Arraste e solte o arquivo aqui'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Suporta PDF, XLSX, XLS e CSV de corretoras homologadas
                  </p>
                </div>
              )}
            </div>
          </div>

          {pdfNeedsPassword && (
            <div className="space-y-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="h-4 w-4" />
                <Label htmlFor="pdf-pass" className="font-bold text-sm">PDF Protegido</Label>
              </div>
              <p className="text-xs text-amber-500/80 leading-relaxed">
                Este arquivo exige senha para ser lido (normalmente o CPF ou senha de cadastro na corretora).
              </p>
              <div className="flex gap-2 mt-2">
                <Input 
                  id="pdf-pass"
                  type="password" 
                  placeholder="Digite a senha do PDF" 
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  className="bg-slate-950 border-white/10 text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {file && (
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white transition-all" 
                onClick={processFile} 
                disabled={isProcessing || (pdfNeedsPassword && !pdfPassword)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    {pdfNeedsPassword ? 'Tentar com Senha' : 'Gerar Preview'}
                  </>
                )}
              </Button>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-zinc-300" onClick={clearImport} disabled={isProcessing}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-indigo-400 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-zinc-400">
            <strong className="text-indigo-400">Nota de Homologação:</strong> O parser está em modo isolado. Não haverá gravação no banco de dados e os saldos consolidados/históricos do Financeiro ou da B3 permanecem intactos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
