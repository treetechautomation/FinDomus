"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Download, Upload, Copy, Share2, Users, Shield, UserPlus } from "lucide-react";
import {
  getActiveHouseholdForUser,
  getHouseholdMembers,
  getHouseholdInvites,
  createHouseholdInvite,
  revokeHouseholdInvite,
} from "@/services/firestore/households";
import { getAccountsWithBalance, getCompanies } from "@/services/firestore/accounts";
import { getCategories } from "@/services/firestore/categories";
import { NewAccountDialog } from "@/components/contas/new-account-dialog";
import { NewCompanyInlineForm } from "@/components/empresas/new-company-inline-form";
import { EditAccountDialog } from "@/components/contas/edit-account-dialog";
import { CategoriesManager } from "@/components/categorias/categories-manager";
import { AIUsagePanel } from "@/components/ai/ai-usage-panel";
import { getFinancialAIData } from "@/services/firestore/financial-ai";
import { getAccountIdentities } from "@/services/firestore/account-identities";
import { useAuth } from "@/providers/auth-provider";

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
  const { user } = useAuth();
  const [aiData, setAIData] = useState<any>(null);

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
          getAccountsWithBalance(user.uid),
          getCompanies(user.uid),
          getCategories(),
            getAccountIdentities(),
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
  }, []);

  const companies = companiesData.map((company: any) => company.name);

  const categoryMap = new Map<string, { id?: string; name: string }>();

  for (const name of defaultCategories) {
    categoryMap.set(name.toLowerCase(), { name });
  }

  for (const category of firestoreCategories) {
    categoryMap.set(category.name.toLowerCase(), category);
  }

  const categories = Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR')
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
        <div className="rounded-xl border bg-card p-6 text-muted-foreground">
          Carregando configurações...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Configurações</h1>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="familia">Família</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="contas">Contas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seu Perfil</CardTitle>
              <CardDescription>Gerencie suas informações pessoais.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Seu Nome</Label>
                  <Input id="userName" defaultValue={user?.displayName || "Usuário Principal"} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Seu E-mail</Label>
                  <Input id="userEmail" defaultValue={user?.email || ""} disabled />
                </div>
              </div>
              
              <div className="rounded-xl border p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">Pessoas vinculadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Identidades financeiras usadas para detectar transferências automaticamente.
                  </p>
                </div>

                <div className="space-y-3">
                  {accountIdentities.map((identity: any) => (
                    <div
                      key={identity.id}
                      className="flex items-start justify-between rounded-lg border bg-secondary/40 p-3"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{identity.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(identity.aliases || []).join(", ")}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant="outline">{identity.ruleType}</Badge>
                        <Badge>transferência</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="familia" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-6 w-6 text-primary" />
                  Membros da Família ({activeMembersCount} de {planInfo.max})
                </CardTitle>
                <CardDescription>
                  Seu plano atual é <strong>{planInfo.name}</strong> (Limite: {planInfo.max} membro{planInfo.max > 1 ? 's' : ''}).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/40">
                      <div>
                        <p className="font-semibold text-white">{member.displayName || member.email}</p>
                        <p className="text-xs text-zinc-400">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
                          {member.role === 'owner' ? 'Proprietário' : member.role === 'admin' ? 'Administrador' : 'Membro'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {invites.length > 0 && (
                  <div className="pt-6 border-t border-zinc-800/80">
                    <h3 className="text-sm font-semibold text-zinc-300 mb-3">Convites Enviados</h3>
                    <div className="space-y-3">
                      {invites.map((invite) => (
                        <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/10 gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">{invite.invitedEmail}</p>
                            <p className="text-xs text-zinc-500">
                              Papel: {invite.role === 'admin' ? 'Administrador' : 'Membro'} | Status: {invite.status === 'pending' ? 'Pendente' : invite.status === 'accepted' ? 'Aceito' : invite.status === 'revoked' ? 'Revogado' : invite.status}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {invite.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCopyLink(invite.id)}
                                  className="h-8 text-xs flex items-center gap-1.5"
                                >
                                  <Copy className="h-3 w-3" /> Copiar Link
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="h-8 text-xs flex items-center gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                                >
                                  <a href={getWhatsAppLink(invite.id)} target="_blank" rel="noopener noreferrer">
                                    <Share2 className="h-3 w-3" /> WhatsApp
                                  </a>
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRevokeInvite(invite.id)}
                                  className="h-8 text-xs"
                                >
                                  Revogar
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <UserPlus className="h-5 w-5 text-[#f59e0b]" />
                  Convidar Membro
                </CardTitle>
                <CardDescription>
                  Envie um convite de acesso para um membro da sua família.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateInvite} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteEmail">E-mail do Convidado</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inviteRole">Papel de Acesso</Label>
                    <select
                      id="inviteRole"
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="w-full h-10 rounded-md border border-zinc-800 bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="member">Membro (Somente leitura/lançamentos)</option>
                      <option value="admin">Administrador (Pode reconciliar/configurar)</option>
                    </select>
                  </div>

                  {errorMsg && (
                    <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-lg">
                      {successMsg}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2"
                    disabled={generatingInvite || totalOccupiedSlots >= planInfo.max}
                  >
                    {generatingInvite ? "Gerando..." : "Gerar Convite"}
                  </Button>

                  {totalOccupiedSlots >= planInfo.max && (
                    <p className="text-xs text-amber-500/90 leading-relaxed text-center mt-2 font-medium">
                      ⚠️ Limite atingido para o plano {planInfo.name}.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="empresas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Empresas (PJ)</CardTitle>
              <CardDescription>Cadastre e gerencie suas empresas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-medium">{company}</span>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {companies.length === 0 && (
                  <div className="text-muted-foreground">Nenhuma empresa cadastrada ainda.</div>
                )}
              </div>
              <NewCompanyInlineForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contas Bancárias</CardTitle>
              <CardDescription>Gerencie suas contas pessoais e empresariais.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account: any) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {accountTypeLabel(account.type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">
                        {Number(account.balance || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </div>
                      <Badge variant={account.owner === 'PF' ? 'default' : 'outline'}>
                        {account.owner === 'PF' ? 'Pessoal' : 'Empresa'}
                      </Badge>
                      <EditAccountDialog account={account} />
                    </div>
                  </div>
                ))}
                {accounts.length === 0 && (
                  <div className="text-muted-foreground">Nenhuma conta cadastrada ainda.</div>
                )}
              </div>

              <NewAccountDialog />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Crie e gerencie suas categorias de despesas e receitas.</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoriesManager categories={categories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
              <CardDescription>Exporte seus dados para um arquivo ou importe um backup existente.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Dados
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar Backup

              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Central de IA Financeira</CardTitle>
              <CardDescription>
                Inteligência financeira comportamental do FinDomus.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <AIUsagePanel userId={user?.uid || "default"} />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Recorrências Detectadas</div>
                  <div className="mt-2 text-3xl font-bold">{aiData?.recurringDetected ?? '-'}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Contas e despesas recorrentes identificadas</div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Assinaturas Detectadas</div>
                  <div className="mt-2 text-3xl font-bold">{aiData?.subscriptions ?? '-'}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Serviços recorrentes monitorados</div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Confiança da IA</div>
                  <div className="mt-2 text-3xl font-bold text-emerald-400">{aiData ? `${aiData.financialHealthScore}%` : '-'}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Precisão do motor comportamental</div>
                </Card>

                <Card className="p-4">
                  <div className="text-sm text-muted-foreground">Previsão Próximo Mês</div>
                  <div className="mt-2 text-3xl font-bold">{aiData
    ? aiData.projectedNextMonth.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    : '-'}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Comprometimento previsto</div>
                </Card>
              </div>

              <Card className="p-5">
                <div className="mb-2 text-lg font-semibold">Insights Financeiros IA</div>
                <div className="space-y-3 text-sm">
                    {aiData?.insights?.map((insight: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border p-3"
                      >
                        <div className="font-medium">
                          {insight.title}
                        </div>

                        <div className="text-muted-foreground text-sm mt-1">
                          {insight.description}
                        </div>

                        {typeof insight.confidence === 'number' && (
                          <div className="text-xs text-emerald-400 mt-2">
                            Confiança IA: {Math.round(insight.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  <div className="rounded-lg border p-3">A IA detectou despesas recorrentes domésticas com alta confiança.</div>
                  <div className="rounded-lg border p-3">Serviços domésticos possuem padrão mensal consistente.</div>
                  <div className="rounded-lg border p-3">Parcelamentos e passivos estão sendo reconciliados corretamente.</div>
                  <div className="rounded-lg border p-3">O sistema já consegue prever parte do fluxo futuro automaticamente.</div>
                </div>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
