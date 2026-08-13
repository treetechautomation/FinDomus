"use client";

import { useEffect, useState } from "react";
import {
  getActiveHouseholdForUser,
  getHouseholdMembers,
  getHouseholdInvites,
  createHouseholdInvite,
  revokeHouseholdInvite,
  removeHouseholdMember,
  updateHouseholdMemberRole,
  transferHouseholdOwnership,
  leaveHousehold,
} from "@/services/firestore/households";
import { getAccountsWithBalance, getCompanies } from "@/services/firestore/accounts";
import { getCategories } from "@/services/firestore/categories";
import { NewAccountDialog } from "@/components/contas/new-account-dialog";
import { NewCompanyInlineForm } from "@/components/empresas/new-company-inline-form";
import { EditAccountDialog } from "@/components/contas/edit-account-dialog";
import { getFinancialAIData } from "@/services/firestore/financial-ai";
import { getAccountIdentities } from "@/services/firestore/account-identities";
import { useAuth } from "@/providers/auth-provider";
import { useVisibility } from "@/providers/visibility-provider";
import { useAcademy } from "@/components/academy";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileConfiguracoesView } from "@/app/(main)/configuracoes/mobile-configuracoes-view";

function accountTypeLabel(type: string) {
  switch (type) {
    case 'checking':
      return 'Conta Corrente';
    case 'investment':
      return 'Investimento';
    case 'wallet':
      return 'Carteira';
    case 'credit_card':
      return 'Cartão';
    case 'savings':
      return 'Poupança';
    default:
      return type;
  }
}

export function ConfiguracoesClient() {
  const { user, profile } = useAuth();
  const [aiData, setAIData] = useState<any>(null);
  const { showFinancialValues, autoHideOnStart, toggleVisibility, setAutoHideOnStart } = useVisibility();
  const { resetAcademy } = useAcademy();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [household, setHousehold] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const PLAN_LIMITS: Record<string, { name: string; max: number }> = {
    individual: { name: 'Individual', max: 1 },
    family: { name: 'Família', max: 3 },
    family_premium: { name: 'Família Premium', max: 10 },
  };

  const planInfo = PLAN_LIMITS[household?.planId || 'individual'] || PLAN_LIMITS.individual;
  const filteredMembers = members.filter(
    (m) => m.userId && m.email && !m.legacy && !m.archived
  );
  const currentUserMember = filteredMembers.find(
    (m) =>
      m.userId === user?.uid ||
      (m.email && m.email === user?.email)
  );
  const currentUserRole =
    currentUserMember?.role ||
    profile?.defaultRole ||
    'member';
  const activeMembersCount = filteredMembers.length;
  const pendingInvitesCount = invites.filter(i => i.status === 'pending').length;
  const totalOccupiedSlots = activeMembersCount + pendingInvitesCount;

  useEffect(() => {
    async function loadFamilyData() {
      if (!user?.uid) return;
      try {
        const hh = await getActiveHouseholdForUser(user.uid);
        if (hh) {
          setHousehold(hh);
          const [mList, iList] = await Promise.all([
            getHouseholdMembers(hh.id),
            getHouseholdInvites(hh.id),
          ]);
          setMembers(mList);
          setInvites(iList);
        }
      } catch (err) {
        console.error('Failed to load family data:', err);
      }
    }
    loadFamilyData();
  }, [user?.uid]);

  const handleRemoveMember = async (memberUserId: string, memberName: string) => {
    if (!household) return;
    const confirm = window.confirm(`Tem certeza de que deseja remover ${memberName} da família?`);
    if (!confirm) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await removeHouseholdMember(household.id, memberUserId);
      setSuccessMsg("Membro removido com sucesso!");
      const mList = await getHouseholdMembers(household.id);
      setMembers(mList);
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao remover membro.");
    }
  };

  const handleUpdateRole = async (memberUserId: string, newRole: 'admin' | 'member') => {
    if (!household) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await updateHouseholdMemberRole(household.id, memberUserId, newRole);
      setSuccessMsg("Papel atualizado com sucesso!");
      const mList = await getHouseholdMembers(household.id);
      setMembers(mList);
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao alterar papel.");
    }
  };

  const handleTransferOwnership = async (newOwnerId: string, memberName: string) => {
    if (!household || !user?.uid) return;
    const confirm = window.confirm(
      `ATENÇÃO: Você está prestes a transferir a propriedade da família para ${memberName}.\n\nVocê se tornará um Administrador. Deseja continuar?`
    );
    if (!confirm) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await transferHouseholdOwnership(household.id, user.uid, newOwnerId);
      setSuccessMsg("Propriedade transferida com sucesso!");
      const [hh, mList] = await Promise.all([
        getActiveHouseholdForUser(user.uid),
        getHouseholdMembers(household.id),
      ]);
      if (hh) setHousehold(hh);
      setMembers(mList);
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao transferir propriedade.");
    }
  };

  const handleLeaveHousehold = async () => {
    if (!household || !user?.uid) return;
    const confirm = window.confirm("Tem certeza de que deseja sair desta família?");
    if (!confirm) return;
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await leaveHousehold(household.id, user.uid);
      setSuccessMsg("Você saiu da família com sucesso.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao sair da família.");
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!household || !user?.uid || !inviteEmail) return;
    setErrorMsg("");
    setSuccessMsg("");
    setGeneratedInvite(null);

    if (!/\S+@\S+\.\S+/.test(inviteEmail)) {
      setErrorMsg("E-mail inválido.");
      return;
    }

    if (totalOccupiedSlots >= planInfo.max) {
      setErrorMsg(`Seu plano (${planInfo.name}) permite no máximo ${planInfo.max} membros (incluindo convites pendentes).`);
      return;
    }

    try {
      setGeneratingInvite(true);
      const invite = await createHouseholdInvite(
        household.id,
        inviteEmail.trim().toLowerCase(),
        inviteRole,
        user.email || user.displayName || 'Administrador'
      );
      setGeneratedInvite(invite);
      setInviteEmail("");
      setSuccessMsg("Convite gerado com sucesso!");

      const iList = await getHouseholdInvites(household.id);
      setInvites(iList);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Falha ao gerar convite.");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleRevokeInvite = async (token: string) => {
    if (!household) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await revokeHouseholdInvite(token);
      setSuccessMsg("Convite revogado com sucesso.");
      const iList = await getHouseholdInvites(household.id);
      setInvites(iList);
    } catch (err) {
      console.error(err);
      setErrorMsg("Falha ao revogar convite.");
    }
  };

  const getInviteUrl = (token: string) => {
    if (typeof window === "undefined") return `/convite/${token}`;
    return `${window.location.origin}/convite/${token}`;
  };

  const getWhatsAppLink = (token: string) => {
    const url = getInviteUrl(token);
    const text = encodeURIComponent(
      `Olá! Estou te convidando para fazer parte da minha família no treeDomus, o nosso sistema de controle financeiro. Para aceitar e acessar, use o link: ${url}`
    );
    return `https://wa.me/?text=${text}`;
  };

  const handleCopyLink = (token: string) => {
    const url = getInviteUrl(token);
    navigator.clipboard.writeText(url);
    alert("Link do convite copiado para a área de transferência!");
  };

  useEffect(() => {
    async function loadAI() {
      if (!user?.uid) return;
      try {
        const data = await getFinancialAIData(user.uid);
        setAIData(data);
      } catch (error) {
        console.error('AI LOAD ERROR', error);
      }
    }

    loadAI();
  }, [user?.uid]);

  const defaultCategories = [
    'Alimentação',
    'Mercado',
    'Supermercado',
    'Moradia (aluguel, condomínio)',
    'Aluguel',
    'Condomínio',
    'Energia',
    'Água',
    'Gás',
    'Internet',
    'Telefone',
    'Transporte',
    'Combustível',
    'Saúde',
    'Plano de saúde',
    'Farmácia',
    'Academia',
    'Educação',
    'Cursos',
    'Livros',
    'Lazer',
    'Compras',
    'Restaurante',
    'Viagem',
    'Assinaturas (Netflix, Spotify etc.)',
    'Seguros',
    'Impostos',
    'Dívidas / Empréstimos',
    'Salário',
    'Pró-labore',
    'Renda Extra',
    'Investimentos (aporte)',
    'Investimentos (rendimentos)',
    'Reserva de emergência',
    'Dividendos',
    'Juros',
    'Outros',
  ];
  const [accounts, setAccounts] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [firestoreCategories, setFirestoreCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountIdentities, setAccountIdentities] = useState<any[]>([]);

  useEffect(() => {
    async function loadConfigData() {
      if (!user?.uid) return;

      try {
        const [
            accountsResult,
            companiesResult,
            categoriesResult,
            identitiesResult,
          ] = await Promise.all([
          getAccountsWithBalance(user.uid).catch(err => {
            console.error('Erro ao carregar contas com saldo:', err);
            return [];
          }),
          getCompanies(user.uid).catch(err => {
            console.error('Erro ao carregar empresas:', err);
            return [];
          }),
          getCategories(user.uid).catch(err => {
            console.error('Erro ao carregar categorias:', err);
            return [];
          }),
          getAccountIdentities(user.uid).catch(err => {
            console.error('Erro ao carregar identidades de conta:', err);
            return [];
          }),
        ]);

        setAccounts(accountsResult || []);
        setCompaniesData(companiesResult || []);
        setFirestoreCategories(categoriesResult || []);
        setAccountIdentities(identitiesResult || []);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setLoading(false);
      }
    }

    loadConfigData();
  }, [user?.uid]);

  const companies = companiesData.map((company: any) => company.name);

  const categoryMap = new Map<string, { id?: string; name: string; keywords?: string[]; isDefault?: boolean; isGlobal?: boolean }>();

  for (const name of defaultCategories) {
    categoryMap.set(name.toLowerCase(), { name, keywords: [], isDefault: true, isGlobal: true });
  }

  for (const category of firestoreCategories) {
    categoryMap.set(category.name.toLowerCase(), category);
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );

  const handleResetAcademy = async () => {
    await resetAcademy();
    toast({
      title: "Academia Reiniciada! 🚀",
      description: "O progresso e as aulas da Academia FinDomus foram reiniciados.",
      duration: 5000,
    });
  };

  const viewProps = {
    loading,
    user,
    accountIdentities,
    activeMembersCount,
    planInfo,
    filteredMembers,
    currentUserRole,
    handleUpdateRole,
    handleTransferOwnership,
    handleRemoveMember,
    handleLeaveHousehold,
    invites,
    handleCopyLink,
    getWhatsAppLink,
    handleRevokeInvite,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    handleCreateInvite,
    errorMsg,
    successMsg,
    generatingInvite,
    totalOccupiedSlots,
    categories,
    aiData,
    showFinancialValues,
    autoHideOnStart,
    toggleVisibility,
    setAutoHideOnStart,
    handleResetAcademy,
  };

  if (isMobile) {
    return (
      <MobileConfiguracoesView
        {...viewProps}
      />
    );
  }

  return (
    <MobileConfiguracoesView
      {...viewProps}
    />
  );
}
