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
import {
  Plus, Search, Filter, Mail, Building2, ChevronRight, Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestão de leads, deals e timeline unificada.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" /> Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Lead</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div><Label>Nome *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@empresa.com" /></div>
                  <div><Label>Telefone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(11) 99999-0000" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Empresa</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nome da empresa" /></div>
                  <div><Label>Cargo</Label><Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Diretor Comercial" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Fonte</Label>
                    <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Outbound">Outbound</SelectItem>
                        <SelectItem value="Inbound">Inbound</SelectItem>
                        <SelectItem value="Indicação">Indicação</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Evento">Evento</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Valor (R$)</Label><Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="50000" type="number" /></div>
                </div>
                <div><Label>Notas</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observações iniciais..." className="min-h-[60px]" /></div>
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-primary text-primary-foreground">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  Criar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            </TabsList>
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 bg-card/80 border-border/30" />
              </div>
            </div>
          </div>

          <TabsContent value="list" className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : leads.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-sm">Nenhum lead encontrado.</p>
                <p className="text-muted-foreground text-xs mt-1">Clique em "Novo Lead" para começar.</p>
              </div>
            ) : (
              leads.map((lead: any) => {
                const status = statusConfig[lead.status] || statusConfig.new;
                return (
                  <Card key={lead.id} className="border-border/30 bg-card/80 hover:border-primary/20 transition-all cursor-pointer" onClick={() => setLocation(`/crm/lead/${lead.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="pipeline">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {pipelineStages.map((stage) => {
                const stageLeads = leads.filter((l: any) => l.status === stage.key);
                return (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">{stageLeads.length}</Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {stageLeads.map((lead: any) => (
                        <Card key={lead.id} className="border-border/30 bg-card/80 hover:border-primary/20 transition-all cursor-pointer" onClick={() => setLocation(`/crm/lead/${lead.id}`)}>
                          <CardContent className="p-3">
                            <p className="text-xs font-semibold text-foreground truncate mb-1">{lead.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate mb-2">{lead.company || "—"}</p>
                            <p className="text-xs font-bold text-primary">{lead.value ? `R$ ${(Number(lead.value) / 1000).toFixed(0)}K` : "—"}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
