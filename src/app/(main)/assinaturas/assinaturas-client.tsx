"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import {
  getRecurringExpenses,
  addRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  type RecurringExpense
} from '@/services/firestore/planning';
import { getCategories, type Category } from '@/services/firestore/categories';
import { getTransactions, addTransaction, type TransactionDTO } from '@/services/firestore/transactions';
import { getAccounts, type Account } from '@/services/firestore/accounts';
import { detectRecurrence, buildMerchantFingerprint } from '@/core/finance/recurrence-engine';
import { getCurrentMonthKey, isTransactionInMonth } from '@/core/finance/financial-period-engine';
import { formatCurrencyBRL as brl, parseCurrencyInput } from '@/lib/utils';
import { learnTransactionCategory } from '@/core/finance/category-learning-engine';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileAssinaturasView from './mobile-assinaturas-view';

const DEFAULT_CATEGORIES = [
  'Assinaturas (Netflix, Spotify etc.)',
  'Moradia (aluguel, condomínio)',
  'Internet / Telefonia',
  'Água',
  'Energia',
  'Gás',
  'Ferramentas / Software',
  'Academia / Bem-estar',
  'Saúde / Plano de saúde',
  'Seguros',
  'Educação / Cursos',
  'Serviços Prestados',
  'Marketing / Ads',
  'Outros'
];


export default function AssinaturasClient() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedExpense, setSelectedExpense] = useState<RecurringExpense | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formAmountRaw, setFormAmountRaw] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formOwner, setFormOwner] = useState<'PF' | 'PJ'>('PF');
  const [formDayOfMonth, setFormDayOfMonth] = useState('5');
  const [formIsActive, setFormIsActive] = useState(true);
  
  // Deleting State
  const [deletingExpense, setDeletingExpense] = useState<RecurringExpense | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Income State
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  
  // Pay Dialog State
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [payingExpense, setPayingExpense] = useState<RecurringExpense | null>(null);
  const [payAccountId, setPayAccountId] = useState('');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paying, setPaying] = useState(false);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'active' | 'suggestions'>('active');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'PF' | 'PJ'>('all');

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const [expensesData, txsData, catsData, accountsData] = await Promise.all([
        getRecurringExpenses(user.uid),
        getTransactions(user.uid),
        getCategories(),
        getAccounts(user.uid)
      ]);

      setRecurringExpenses(expensesData || []);
      setTransactions(txsData || []);
      setAccounts(accountsData || []);

      const currentMonth = getCurrentMonthKey();
      const incomeVal = (txsData || [])
        .filter(t => isTransactionInMonth(t, currentMonth) && t.type === 'income' && t.owner === 'PF')
        .reduce((s, t) => s + Number(t.amount || 0), 0);
      setMonthlyIncome(incomeVal);

      const uniqueCats = Array.from(
        new Set([
          ...(catsData || []).map((c: Category) => c.name),
          ...DEFAULT_CATEGORIES
        ])
      ).filter(Boolean);
      setCategories(uniqueCats);
    } catch (err: any) {
      console.error('Erro ao carregar assinaturas:', err);
      toast({
        title: 'Erro ao carregar dados',
        description: err.message || 'Ocorreu um erro desconhecido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  // Totals calculations
  const totals = useMemo(() => {
    let pfTotal = 0;
    let pjTotal = 0;
    let pfCount = 0;
    let pjCount = 0;

    recurringExpenses.forEach((item) => {
      if (!item.isActive) return;
      if (item.owner === 'PF') {
        pfTotal += item.amount;
        pfCount++;
      } else {
        pjTotal += item.amount;
        pjCount++;
      }
    });

    return {
      pfTotal,
      pjTotal,
      total: pfTotal + pjTotal,
      pfCount,
      pjCount,
      totalCount: pfCount + pjCount
    };
  }, [recurringExpenses]);

  // Check if paid in the current month (Optimized to O(n+m))
  const paidExpenseNames = useMemo(() => {
    const currentMonth = getCurrentMonthKey();
    const paid = new Set<string>();
    transactions
      .filter(t => t.monthKey === currentMonth && t.type === 'expense')
      .forEach(t => {
        const norm = (t.description || t.merchant || '').toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
        paid.add(norm);
      });
    return paid;
  }, [transactions]);

  const isPaidThisMonth = (expense: RecurringExpense) => {
    const normExp = expense.name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return paidExpenseNames.has(normExp) ||
      [...paidExpenseNames].some(name => name.includes(normExp) || normExp.includes(name));
  };

  // IA Suggestions detection logic
  const suggestions = useMemo(() => {
    if (!transactions.length) return [];

    // Group only expenses
    const expenseGroups = new Map<string, TransactionDTO[]>();
    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;

      const fingerprint = buildMerchantFingerprint(
        tx.description || tx.merchant || '',
        tx.category
      );

      if (!expenseGroups.has(fingerprint)) {
        expenseGroups.set(fingerprint, []);
      }
      expenseGroups.get(fingerprint)?.push(tx);
    });

    const results: any[] = [];

    for (const [fingerprint, items] of expenseGroups.entries()) {
      if (items.length < 3) continue; // Minimum transactions to run detection

      const analysis = detectRecurrence(items);

      if (analysis.isRecurring) {
        // Find average amount
        const avgAmount = items.reduce((sum, item) => sum + Math.abs(item.amount), 0) / items.length;
        
        // Find most common day of month
        const days = items.map(t => {
          const d = t.dateISO ? new Date(t.dateISO) : t.date ? new Date(t.date) : new Date();
          return d.getDate();
        });
        const commonDay = days.sort((a,b) =>
          days.filter(v => v===a).length - days.filter(v => v===b).length
        ).pop() || 5;

        const sample = items[0];
        const name = sample.merchant || sample.description || 'Despesa Recorrente';

        // Check if already registered
        const isRegistered = recurringExpenses.some((re) => {
          const normRe = re.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const normSug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          return normRe.includes(normSug) || normSug.includes(normRe);
        });

        if (!isRegistered) {
          results.push({
            fingerprint,
            name,
            amount: avgAmount,
            category: sample.category || 'Outros',
            dayOfMonth: commonDay,
            confidence: analysis.recurrenceConfidence,
            frequency: analysis.recurrenceFrequency || 'monthly',
            owner: sample.owner || 'PF',
            occurrences: items.length
          });
        }
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }, [transactions, recurringExpenses]);

  const filteredExpenses = useMemo(() => {
    return recurringExpenses.filter((item) => {
      if (ownerFilter === 'all') return true;
      return item.owner === ownerFilter;
    });
  }, [recurringExpenses, ownerFilter]);

  const filteredAccountsForPayment = useMemo(() => {
    if (!payingExpense) return [];
    return accounts.filter(acc => acc.owner === payingExpense.owner);
  }, [accounts, payingExpense]);

  const handleOpenCreate = () => {
    setDialogMode('create');
    setSelectedExpense(null);
    setFormName('');
    setFormAmountRaw('');
    setFormCategory(categories[0] || 'Outros');
    setFormOwner('PF');
    setFormDayOfMonth('5');
    setFormIsActive(true);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (expense: RecurringExpense) => {
    setDialogMode('edit');
    setSelectedExpense(expense);
    setFormName(expense.name);
    setFormAmountRaw(String(Math.round(expense.amount * 100)));
    setFormCategory(expense.category || 'Outros');
    setFormOwner(expense.owner);
    setFormDayOfMonth((expense.dayOfMonth || 5).toString());
    setFormIsActive(expense.isActive);
    setIsDialogOpen(true);
  };

  const handleOpenPay = (expense: RecurringExpense) => {
    setPayingExpense(expense);
    setPayAccountId('');
    setPayDate(new Date().toISOString().slice(0, 10));
    setIsPayDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!user?.uid || !deletingExpense?.id) return;
    setDeleting(true);
    try {
      await deleteRecurringExpense(user.uid, deletingExpense.id);
      toast({
        title: 'Removido com sucesso',
        description: 'A despesa recorrente foi removida.',
      });
      setDeletingExpense(null);
      loadData();
    } catch (err: any) {
      toast({
        title: 'Erro ao remover',
        description: err.message || 'Não foi possível remover o item.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (expense: RecurringExpense) => {
    if (!user?.uid || !expense.id) return;
    try {
      await updateRecurringExpense(user.uid, expense.id, {
        isActive: !expense.isActive
      });
      toast({
        title: expense.isActive ? 'Despesa desativada' : 'Despesa ativada',
        description: `O status da recorrência foi atualizado.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const numericAmount = parseCurrencyInput(formAmountRaw);
    if (!formName.trim() || isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: 'Campos inválidos',
        description: 'Preencha o nome e um valor maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data: RecurringExpense = {
        name: formName.trim(),
        amount: numericAmount,
        category: formCategory,
        owner: formOwner,
        frequency: 'monthly',
        dayOfMonth: Number(formDayOfMonth),
        isActive: formIsActive,
        createdAt: selectedExpense?.createdAt || new Date().toISOString(),
      };

      if (dialogMode === 'create') {
        await addRecurringExpense(user.uid, data);
        toast({
          title: 'Adicionado com sucesso',
          description: 'Nova despesa recorrente registrada.',
        });
      } else if (dialogMode === 'edit' && selectedExpense?.id) {
        await updateRecurringExpense(user.uid, selectedExpense.id, data);
        toast({
          title: 'Atualizado com sucesso',
          description: 'Os dados da recorrência foram salvos.',
        });
      }

      setIsDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !payingExpense) return;
    if (!payAccountId) {
      toast({
        title: 'Selecione uma conta',
        description: 'Selecione a conta de origem do pagamento.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPaying(true);
      const selectedAccount = accounts.find(acc => acc.id === payAccountId);

      await addTransaction(user.uid, {
        description: payingExpense.name,
        category: payingExpense.category || 'Outros',
        type: 'expense',
        amount: payingExpense.amount,
        date: payDate,
        owner: payingExpense.owner,
        accountId: payAccountId,
        companyId: payingExpense.owner === 'PJ' ? (selectedAccount?.companyId || null) : null,
      });

      toast({
        title: 'Pagamento registrado',
        description: `A despesa "${payingExpense.name}" de ${brl(payingExpense.amount)} foi lançada nas despesas mensais.`,
      });

      setIsPayDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar pagamento',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setPaying(false);
    }
  };

  const handleQuickImport = async (suggestion: any) => {
    if (!user?.uid) return;
    try {
      const data: RecurringExpense = {
        name: suggestion.name,
        amount: suggestion.amount,
        category: suggestion.category,
        owner: suggestion.owner,
        frequency: 'monthly',
        dayOfMonth: suggestion.dayOfMonth,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastDetectedAt: new Date().toISOString(),
      };

      await addRecurringExpense(user.uid, data);

      // Alimenta o sistema de aprendizado de categorias
      learnTransactionCategory({
        description: suggestion.name,
        category: suggestion.category,
        userId: user.uid,
      }).catch((e) => console.error('Erro ao ensinar categoria:', e));

      toast({
        title: 'Importado com sucesso',
        description: `A recorrência "${suggestion.name}" foi adicionada.`,
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Erro ao importar',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  function getDaysUntilDue(dayOfMonth: number) {
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (dueDate < today) dueDate.setMonth(dueDate.getMonth() + 1);
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  const isMobile = useIsMobile();

  const viewProps = {
    loading,
    categories,
    totals,
    monthlyIncome,
    activeTab,
    setActiveTab,
    suggestions,
    ownerFilter,
    setOwnerFilter,
    filteredExpenses,
    isDialogOpen,
    setIsDialogOpen,
    dialogMode,
    formName,
    setFormName,
    formAmountRaw,
    setFormAmountRaw,
    formCategory,
    setFormCategory,
    formOwner,
    setFormOwner,
    formDayOfMonth,
    setFormDayOfMonth,
    formIsActive,
    setFormIsActive,
    isPayDialogOpen,
    setIsPayDialogOpen,
    payingExpense,
    payAccountId,
    setPayAccountId,
    payDate,
    setPayDate,
    filteredAccountsForPayment,
    paying,
    deletingExpense,
    setDeletingExpense,
    deleting,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenPay,
    handleDeleteConfirm,
    handleToggleActive,
    handleSave,
    handleConfirmPayment,
    handleQuickImport,
    isPaidThisMonth,
    getDaysUntilDue,
  };

  if (isMobile) {
    return <MobileAssinaturasView {...viewProps} />;
  }

  return <MobileAssinaturasView {...viewProps} />;
}
