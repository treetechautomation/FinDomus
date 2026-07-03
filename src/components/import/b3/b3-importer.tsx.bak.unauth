'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { TrendingUp, Upload, AlertCircle, FileText, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import { B3ParseResult } from '@/types/import/b3';
import { B3Preview } from './b3-preview';

export function B3Importer() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [parsedData, setParsedData] = useState<B3ParseResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
      setParsedData(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  const clearFile = () => {
    setFile(null);
    setParsedData(null);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setParsedData(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/b3', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar o arquivo.');
      }

      setParsedData(result.data);
      
      if (result.data.errors && result.data.errors.length > 0) {
        toast({
          title: 'Extração Concluída com Alertas',
          description: `Foram encontrados ${result.data.errors.length} erros no parser.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Extração Concluída',
          description: 'Os dados foram extraídos com sucesso. Verifique o preview.',
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro de Importação',
        description: error.message || 'Falha ao processar arquivo B3.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData || !file || !user) return;

    setIsConfirming(true);

    try {
      const response = await fetch('/api/import/b3/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          fileName: file.name,
          parsedData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao persistir os dados.');
      }

      toast({
        title: 'Importação Concluída',
        description: 'Os dados foram salvos com sucesso na carteira B3.',
      });

      clearFile();
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Erro na Persistência',
        description: error.message || 'Falha ao salvar dados B3.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-amber-500/20 bg-slate-950/40 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <TrendingUp className="h-6 w-6" />
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Em Homologação</Badge>
          </div>
          <CardTitle className="text-xl font-bold">Importador B3 (Isolado)</CardTitle>
          <CardDescription>
            Faça upload do seu "Relatório anual consolidado" da B3 em PDF. 
            O módulo extrairá Posições e Proventos para o Preview (Sem gravar no banco).
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-4 ${
                isDragActive 
                  ? 'border-amber-500 bg-amber-500/5 scale-[0.99]' 
                  : 'border-white/10 hover:border-amber-500/50 hover:bg-white/[0.02]'
              }`}
            >
              <input {...getInputProps()} />
              <div className={`p-4 rounded-full transition-colors duration-300 ${isDragActive ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                <Upload className={`h-8 w-8 ${isDragActive ? 'text-amber-500' : 'text-zinc-400'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300 mb-1">
                  {isDragActive ? 'Solte o relatório PDF aqui' : 'Clique ou arraste o relatório B3 aqui'}
                </p>
                <p className="text-xs text-zinc-500">Aceita arquivos PDF da Área do Investidor (Relatório Consolidado)</p>
              </div>
            </div>
          ) : (
            <div className="border border-white/10 bg-white/5 rounded-xl p-4 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearFile}
                  disabled={isProcessing}
                  className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-amber-500 bg-amber-500/10 p-3 rounded-md border border-amber-500/20">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">
              Aviso: Este ambiente está isolado do Financeiro. O processamento servirá apenas para validação visual no Preview.
            </p>
          </div>

          <div className="pt-4 border-t border-white/5 flex gap-4">
            <Button 
              onClick={processFile} 
              disabled={!file || isProcessing}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold flex-1 md:flex-none md:w-48"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Extrair Relatório B3'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {parsedData && (
        <B3Preview 
          data={parsedData} 
          onConfirm={handleConfirm} 
          isConfirming={isConfirming} 
        />
      )}
    </div>
  );
}
