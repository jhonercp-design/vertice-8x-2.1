import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, Mail, Building2, ChevronRight, Loader2, Users, TrendingUp, DollarSign,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import PipelineBoard from "@/components/PipelineBoard";
import { PipelineManager } from "@/components/PipelineManager";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "text-blue-400", bg: "bg-blue-400/15" },
  contacted: { label: "Contatado", color: "text-purple-400", bg: "bg-purple-400/15" },
  qualified: { label: "Qualificado", color: "text-primary", bg: "bg-primary/15" },
  proposal: { label: "Proposta", color: "text-brand-warning", bg: "bg-brand-warning/15" },
  negotiation: { label: "Negociação", color: "text-cyan-400", bg: "bg-cyan-400/15" },
  won: { label: "Ganho", color: "text-brand-success", bg: "bg-brand-success/15" },
  lost: { label: "Perdido", color: "text-brand-danger", bg: "bg-brand-danger/15" },
};

const pipelineStages = [
  { key: "new", label: "Novos" },
  { key: "contacted", label: "Contatados" },
  { key: "qualified", label: "Qualificados" },
  { key: "proposal", label: "Proposta" },
  { key: "negotiation", label: "Negociação" },
  { key: "won", label: "Ganhos" },
];

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function CRM() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", position: "", source: "Outbound", value: "", notes: "" });

  const utils = trpc.useUtils();
  const { data: leads = [], isLoading } = trpc.leads.list.useQuery({ search: search || undefined });

  const createMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      setOpen(false);
      setForm({ name: "", email: "", phone: "", company: "", position: "", source: "Outbound", value: "", notes: "" });
      toast.success("Lead criado com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    createMutation.mutate({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      company: form.company || undefined,
      position: form.position || undefined,
      source: form.source || undefined,
      value: form.value || undefined,
      notes: form.notes || undefined,
    });
  };

  const totalValue = leads.reduce((sum: number, l: any) => sum + (Number(l.value) || 0), 0);
  const qualifiedLeads = leads.filter((l: any) => l.status === "qualified").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">CRM</h1>
              <p className="text-muted-foreground mt-2">Gerencie seus leads, deals e oportunidades em um único lugar.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Novo Lead
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/30 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Criar Novo Lead</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nome *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" className="mt-1 bg-input border-border/50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Telefone</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-0000" className="mt-1 bg-input border-border/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Empresa</Label>
                      <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nome da empresa" className="mt-1 bg-input border-border/50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Cargo</Label>
                      <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Diretor Comercial" className="mt-1 bg-input border-border/50" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Fonte</Label>
                      <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                        <SelectTrigger className="mt-1 bg-input border-border/50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Outbound">Outbound</SelectItem>
                          <SelectItem value="Inbound">Inbound</SelectItem>
                          <SelectItem value="Indicação">Indicação</SelectItem>
                          <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                          <SelectItem value="Evento">Evento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Valor (R$)</Label>
                      <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="50000" type="number" className="mt-1 bg-input border-border/50" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Notas</Label>
                    <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observações iniciais..." className="mt-1 min-h-[60px] bg-input border-border/50" />
                  </div>
                  <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500 hover:scale-105">
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar Lead
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total de Leads", value: leads.length, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Leads Qualificados", value: qualifiedLeads, icon: TrendingUp, color: "from-green-500 to-green-600" },
            { label: "Valor Total", value: `R$ ${(totalValue / 1000).toFixed(0)}K`, icon: DollarSign, color: "from-purple-500 to-purple-600" },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
              <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} opacity-10`}>
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <Tabs defaultValue="list" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <TabsList className="bg-card/50 border border-border/30">
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border/50" />
                </div>
              </div>
            </div>

            <TabsContent value="list" className="space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum lead encontrado</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden divide-y divide-border/30">
                  {leads.map((lead: any, idx: number) => {
                    const status = statusConfig[lead.status] || statusConfig.new;
                    return (
                      <motion.div key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 hover:bg-card/50 transition-colors group cursor-pointer" onClick={() => setLocation(`/crm/lead/${lead.id}`)}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 opacity-20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">{lead.name?.charAt(0) || "?"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-sm text-foreground truncate">{lead.name}</span>
                              <Badge className={`${status.bg} ${status.color} border-0 text-[10px]`}>{status.label}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {lead.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {lead.company}</span>}
                              {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {lead.email}</span>}
                            </div>
                          </div>
                          <div className="hidden md:flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-sm font-bold text-foreground">{lead.value ? `R$ ${Number(lead.value).toLocaleString("pt-BR")}` : "—"}</p>
                              <p className="text-[10px] text-muted-foreground">{lead.source || ""}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pipeline">
              <PipelineBoard />
            </TabsContent>

            <TabsContent value="settings">
              <div className="space-y-6">
                <PipelineManager />
              </div>
            </TabsContent>

            {/* Old pipeline code - kept for reference */}
            <TabsContent value="pipeline-old" className="hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {pipelineStages.map((stage) => {
                  const stageLeads = leads.filter((l: any) => l.status === stage.key);
                  return (
                    <motion.div key={stage.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5 px-1.5">{stageLeads.length}</Badge>
                      </div>
                      <div className="space-y-2 min-h-[200px]">
                        {stageLeads.map((lead: any, idx: number) => (
                          <motion.div key={lead.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} className="group relative overflow-hidden rounded-lg border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-3 hover:border-primary/50 transition-all cursor-pointer" onClick={() => setLocation(`/crm/lead/${lead.id}`)}>
                            <p className="text-xs font-semibold text-foreground truncate mb-1">{lead.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate mb-2">{lead.company || "—"}</p>
                            <p className="text-xs font-bold text-primary">{lead.value ? `R$ ${(Number(lead.value) / 1000).toFixed(0)}K` : "—"}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
