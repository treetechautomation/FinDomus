'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, BrainCircuit, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { auth } from '@/lib/firebase';
import { getIdToken } from 'firebase/auth';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o Assistente IA do FinDomus. Posso te ajudar a analisar seus saldos, entender seus gastos, projetar fluxo de caixa e tirar dúvidas financeiras. O que deseja saber?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input.trim();
    setInput('');
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const token = auth.currentUser ? await getIdToken(auth.currentUser) : null;
      if (!token) {
        throw new Error('Usuário não autenticado no Firebase.');
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessageText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar requisição');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Desculpe, não consegui processar a resposta.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Erro: ${err.message || 'Houve um problema de conexão com a IA.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/20 text-white flex items-center justify-center border border-amber-400/30 transition-all duration-300 hover:scale-110 z-50 animate-bounce"
        id="ai-chat-trigger"
      >
        <Sparkles className="h-6 w-6 animate-pulse" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-80 md:w-96 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-2xl transition-all duration-300 z-50 overflow-hidden flex flex-col ${
        isMinimized ? 'h-14' : 'h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
            <BrainCircuit className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
              FinDomus AI
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1">Gemini</span>
            </h3>
            {!isMinimized && <p className="text-[10px] text-zinc-400">Online e pronto para ajudar</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-white/5"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main chat interface */}
      {!isMinimized && (
        <>
          {/* Messages area */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${
                      msg.role === 'user'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-white/5 text-zinc-300 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="bg-slate-900 border border-white/5 text-zinc-400 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Cérebro financeiro pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Footer form */}
          <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-slate-950 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre seus saldos ou gastos..."
              className="flex-1 bg-slate-900 border-white/10 text-xs focus-visible:ring-amber-500 focus-visible:ring-offset-0 placeholder:text-zinc-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 h-9 w-9 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
