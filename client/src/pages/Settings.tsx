import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success("Configurações salvas com sucesso");
    setIsSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-orange-500 opacity-10">
              <SettingsIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Configurações</h1>
              <p className="text-muted-foreground mt-1">Gerencie seu perfil, notificações e preferências.</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-gradient-to-r from-card/80 to-card/40 border border-border/30 p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Segurança
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Aparência
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <h2 className="text-lg font-bold mb-6">Informações do Perfil</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input defaultValue={user?.name || ""} placeholder="Seu nome" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue={user?.email || ""} placeholder="seu@email.com" disabled className="mt-1 bg-input border-border/50 opacity-50" />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Input placeholder="Ex: Diretor de Vendas" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div>
                    <Label>Departamento</Label>
                    <Input placeholder="Ex: Comercial" className="mt-1 bg-input border-border/50" />
                  </div>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <User className="w-4 h-4 mr-1" />}
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <h2 className="text-lg font-bold mb-6">Preferências de Notificações</h2>
                <div className="space-y-4">
                  {[
                    { label: "Novos leads", description: "Notificar quando um novo lead for adicionado" },
                    { label: "Deals ganhos", description: "Notificar quando um deal for ganho" },
                    { label: "Alertas AGC", description: "Notificar sobre alertas do Agente de Governança" },
                    { label: "Lembretes de follow-up", description: "Notificar sobre follow-ups pendentes" },
                  ].map((notif, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/50 hover:bg-card/70 transition-colors">
                      <div>
                        <p className="font-semibold text-sm">{notif.label}</p>
                        <p className="text-xs text-muted-foreground">{notif.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <h2 className="text-lg font-bold mb-6">Segurança</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Senha Atual</Label>
                    <Input type="password" placeholder="••••••••" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div>
                    <Label>Nova Senha</Label>
                    <Input type="password" placeholder="••••••••" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div>
                    <Label>Confirmar Senha</Label>
                    <Input type="password" placeholder="••••••••" className="mt-1 bg-input border-border/50" />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary to-orange-500">Atualizar Senha</Button>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <h2 className="text-lg font-bold mb-6">Aparência</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Tema</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {["Claro", "Escuro"].map((theme) => (
                        <button key={theme} className="p-4 rounded-lg border-2 border-border/30 hover:border-primary/50 transition-colors text-center font-semibold text-sm">
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Densidade</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {["Compacta", "Normal", "Espaçosa"].map((density) => (
                        <button key={density} className="p-4 rounded-lg border-2 border-border/30 hover:border-primary/50 transition-colors text-center font-semibold text-sm">
                          {density}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
