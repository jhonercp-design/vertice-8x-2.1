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
  Zap, Plus, Loader2, Trash2, ArrowRight, MessageCircle, Mail, Bell, UserCheck, ListChecks, Workflow,
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
  const [form, setForm] = useState({ name: "", trigger: "lead_status_change" as const, action: "send_whatsapp" as const });

  const utils = trpc.useUtils();
  const { data: automations = [], isLoading } = trpc.automations.list.useQuery();

  const createMutation = trpc.automations.create.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); setOpen(false); setForm({ name: "", trigger: "lead_status_change", action: "send_whatsapp" }); toast.success("Automação criada!"); },
  });

  const deleteMutation = trpc.automations.delete.useMutation({
    onSuccess: () => { utils.automations.list.invalidate(); toast.success("Automação deletada!"); },
  });

  const toggleMutation = trpc.automations.toggle.useMutation({
    onSuccess: () => utils.automations.list.invalidate(),
  });

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    createMutation.mutate(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Automações</h1>
              <p className="text-muted-foreground mt-2">Gatilhos e ações para otimizar sua operação comercial.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Nova Automação
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Automação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Notificar quando lead qualificado" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div>
                    <Label>Gatilho</Label>
                    <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v as any })}>
                      <SelectTrigger className="mt-1 bg-input border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(triggerLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ação</Label>
                    <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v as any })}>
                      <SelectTrigger className="mt-1 bg-input border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(actionLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Automations List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : automations.length === 0 ? (
              <div className="p-12 text-center">
                <Workflow className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma automação criada ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {automations.map((auto: any, idx: number) => {
                  const ActionIcon = actionIcons[auto.action];
                  return (
                    <motion.div key={auto.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 hover:bg-card/50 transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Workflow className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{auto.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-[10px]">{triggerLabels[auto.trigger]}</Badge>
                              <ArrowRight className="w-3 h-3" />
                              <Badge variant="outline" className="text-[10px]">{actionLabels[auto.action]}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={auto.active} onCheckedChange={() => toggleMutation.mutate({ id: auto.id, isActive: !auto.active })} />
                          <button onClick={() => deleteMutation.mutate({ id: auto.id })} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
