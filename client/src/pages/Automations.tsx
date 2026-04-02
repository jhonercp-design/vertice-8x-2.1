import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Zap, Plus, Loader2, Trash2, ArrowRight, MessageCircle, Mail, Bell, UserCheck, ListChecks,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const triggerLabels: Record<string, string> = {
  lead_status_change: "Lead muda de status",
  deal_stage_change: "Deal muda de estágio",
  agc_alert: "Alerta do AGC",
  scheduled: "Agendado",
  manual: "Manual",
};

const actionLabels: Record<string, string> = {
  send_whatsapp: "Enviar WhatsApp",
  create_task: "Criar tarefa",
  send_email: "Enviar email",
  notify_team: "Notificar equipe",
  update_lead: "Atualizar lead",
};

const actionIcons: Record<string, any> = {
  send_whatsapp: MessageCircle,
  create_task: ListChecks,
  send_email: Mail,
  notify_team: Bell,
  update_lead: UserCheck,
};

export default function Automations() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: "lead_status_change", action: "send_whatsapp" });

  const utils = trpc.useUtils();
  const { data: automations = [], isLoading } = trpc.automations.list.useQuery();

  const createMutation = trpc.automations.create.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); setOpen(false); setForm({ name: "", trigger: "lead_status_change", action: "send_whatsapp" }); toast.success("Automação criada!"); },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = trpc.automations.toggle.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); },
  });

  const deleteMutation = trpc.automations.delete.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); toast.success("Automação removida!"); },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Automações</h1>
              <p className="text-xs text-muted-foreground">Gatilhos inteligentes para sua operação comercial</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Nova Automação</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Nova Automação</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Follow-up automático" /></div>
                <div>
                  <Label>Gatilho</Label>
                  <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(triggerLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ação</Label>
                  <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; } createMutation.mutate({ name: form.name, trigger: form.trigger as any, action: form.action as any }); }} disabled={createMutation.isPending} className="bg-primary text-primary-foreground">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Criar Automação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : automations.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma automação criada.</p>
            <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Automação" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {automations.map((auto: any, i: number) => {
              const ActionIcon = actionIcons[auto.action] || Zap;
              return (
                <motion.div key={auto.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border-border/30 bg-card/80 hover:border-primary/20 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">{auto.name}</span>
                            {auto.isActive ? (
                              <Badge className="bg-brand-success/15 text-brand-success border-0 text-[10px]">Ativo</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-[10px]">Inativo</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{triggerLabels[auto.trigger] || auto.trigger}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="flex items-center gap-1"><ActionIcon className="w-3 h-3" /> {actionLabels[auto.action] || auto.action}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <Switch checked={auto.isActive} onCheckedChange={(checked) => toggleMutation.mutate({ id: auto.id, isActive: checked })} />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brand-danger" onClick={() => deleteMutation.mutate({ id: auto.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
