import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Configurações</h1>
            <p className="text-xs text-muted-foreground">
              Gerencie seu perfil, notificações e preferências
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile"><User className="w-3.5 h-3.5 mr-1.5" />Perfil</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-3.5 h-3.5 mr-1.5" />Notificações</TabsTrigger>
            <TabsTrigger value="preferences"><Palette className="w-3.5 h-3.5 mr-1.5" />Preferências</TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile">
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Nome</Label>
                  <Input defaultValue={user?.name || ""} className="h-9 bg-background/50 border-border/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Email</Label>
                  <Input defaultValue={user?.email || ""} disabled className="h-9 bg-muted/30 border-border/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Cargo</Label>
                  <Input placeholder="Ex: Diretor Comercial" className="h-9 bg-background/50 border-border/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Telefone</Label>
                  <Input placeholder="(00) 00000-0000" className="h-9 bg-background/50 border-border/30" />
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground"
                  onClick={() => toast.success("Perfil atualizado com sucesso")}
                >
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Alertas do AGC", description: "Receba alertas críticos de governança comercial", defaultChecked: true },
                  { label: "Novos leads", description: "Notificação quando um novo lead entrar no CRM", defaultChecked: true },
                  { label: "Deals parados", description: "Alerta quando um deal ficar sem movimentação", defaultChecked: true },
                  { label: "Relatórios semanais", description: "Resumo semanal de performance por email", defaultChecked: false },
                  { label: "WhatsApp", description: "Notificações de novas mensagens no WhatsApp", defaultChecked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Preferências do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Modo escuro", description: "Tema escuro para melhor visualização", defaultChecked: true },
                  { label: "Animações", description: "Transições e micro-interações na interface", defaultChecked: true },
                  { label: "Som de notificações", description: "Reproduzir som ao receber notificações", defaultChecked: false },
                  { label: "Dados em tempo real", description: "Atualização automática do dashboard", defaultChecked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
