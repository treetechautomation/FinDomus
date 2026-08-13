"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { X, Download, Upload, Copy, Share2, Users, Shield, UserPlus, Eye, EyeOff, RotateCcw } from "lucide-react";
import { CategoriesManager } from "@/components/categorias/categories-manager";
import { AIUsagePanel } from "@/components/ai/ai-usage-panel";

export interface MobileConfiguracoesViewProps {
  loading: boolean;
  user: any;
  accountIdentities: any[];
  activeMembersCount: number;
  planInfo: { name: string; max: number };
  filteredMembers: any[];
  currentUserRole: string;
  handleUpdateRole: (memberUserId: string, newRole: 'admin' | 'member') => void;
  handleTransferOwnership: (newOwnerId: string, memberName: string) => void;
  handleRemoveMember: (memberUserId: string, memberName: string) => void;
  handleLeaveHousehold: () => void;
  invites: any[];
  handleCopyLink: (token: string) => void;
  getWhatsAppLink: (token: string) => string;
  handleRevokeInvite: (token: string) => void;
  inviteEmail: string;
  setInviteEmail: (value: string) => void;
  inviteRole: "admin" | "member";
  setInviteRole: (value: "admin" | "member") => void;
  handleCreateInvite: (e: React.FormEvent) => void;
  errorMsg: string;
  successMsg: string;
  generatingInvite: boolean;
  totalOccupiedSlots: number;
  categories: any[];
  aiData: any;
  showFinancialValues: boolean;
  autoHideOnStart: boolean;
  toggleVisibility: () => void;
  setAutoHideOnStart: (value: boolean) => void;
  handleResetAcademy: () => void;
}

export function MobileConfiguracoesView({
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
}: MobileConfiguracoesViewProps) {
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="familia">Família</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
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

                        {/* Ações do Owner nos outros membros */}
                        {currentUserRole === 'owner' && member.userId !== user?.uid && (
                          <div className="flex items-center gap-2 ml-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.userId, e.target.value as 'admin' | 'member')}
                              className="h-8 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-zinc-700"
                            >
                              <option value="member">Membro</option>
                              <option value="admin">Administrador</option>
                            </select>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTransferOwnership(member.userId, member.displayName || member.email)}
                              className="h-8 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex items-center gap-1"
                              title="Transferir Propriedade"
                            >
                              <Shield className="h-3 w-3" /> Transferir
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveMember(member.userId, member.displayName || member.email)}
                              className="h-8 px-2"
                              title="Remover Membro"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* Botão de sair para membros/admins não-proprietários */}
                        {member.userId === user?.uid && currentUserRole !== 'owner' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleLeaveHousehold}
                            className="h-8 text-xs ml-2"
                          >
                            Sair da Família
                          </Button>
                        )}
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

            {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
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
            )}
          </div>
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
    ? showFinancialValues
      ? aiData.projectedNextMonth.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        })
      : '••••••••••'
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

        <TabsContent value="preferencias" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências da Experiência</CardTitle>
              <CardDescription>Personalize suas preferências de segurança de tela e onboarding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="show-financials" className="text-sm font-bold text-white flex items-center gap-2">
                    <Eye className="h-4 w-4 text-cyan-400" />
                    Exibir valores financeiros
                  </Label>
                  <p className="text-xs text-zinc-400">
                    Oculta ou exibe saldos, limites e gráficos financeiros em todas as telas da plataforma.
                  </p>
                </div>
                <Switch
                  id="show-financials"
                  checked={showFinancialValues}
                  onCheckedChange={toggleVisibility}
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-hide" className="text-sm font-bold text-white flex items-center gap-2">
                    <EyeOff className="h-4 w-4 text-amber-500" />
                    Ocultar automaticamente ao iniciar
                  </Label>
                  <p className="text-xs text-zinc-400">
                    Sempre inicia o sistema com todos os valores financeiros ocultos por padrão.
                  </p>
                </div>
                <Switch
                  id="auto-hide"
                  checked={autoHideOnStart}
                  onCheckedChange={setAutoHideOnStart}
                />
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/20 p-4 space-y-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-white flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-emerald-400" />
                    Academia FinDomus (Onboarding)
                  </Label>
                  <p className="text-xs text-zinc-400">
                    Apaga o registro de aulas assistidas e reinicia a jornada educacional de onboarding.
                  </p>
                </div>
                <Button
                  onClick={handleResetAcademy}
                  className="h-9 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-200"
                >
                  Reiniciar Academia
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
