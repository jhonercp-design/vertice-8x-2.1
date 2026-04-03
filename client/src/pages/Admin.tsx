import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Crown, Building2, Users, DollarSign, Activity, Plus, AlertTriangle, Loader2, Trash2, CheckCircle2, TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: "Trial", color: "text-muted-foreground", bg: "bg-muted/50" },
  starter: { label: "Starter", color: "text-blue-400", bg: "bg-blue-400/15" },
  professional: { label: "Professional", color: "text-primary", bg: "bg-primary/15" },
  enterprise: { label: "Enterprise", color: "text-brand-success", bg: "bg-brand-success/15" },
};

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export default function Admin() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", plan: "trial", maxSeats: "3", mrrValue: "0" });

  const utils = trpc.useUtils();
  const { data: companies = [], isLoading } = trpc.admin.companies.list.useQuery();
  const { data: stats } = trpc.admin.stats.useQuery();

  const createMutation = trpc.admin.companies.create.useMutation({
    onSuccess: () => { utils.admin.companies.list.invalidate(); utils.admin.stats.invalidate(); setOpen(false); setForm({ name: "", plan: "trial", maxSeats: "3", mrrValue: "0" }); toast.success("Empresa criada!"); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.companies.delete.useMutation({
    onSuccess: () => { utils.admin.companies.list.invalidate(); utils.admin.stats.invalidate(); toast.success("Empresa removida!"); },
  });

  const toggleMutation = trpc.admin.companies.update.useMutation({
    onSuccess: () => { utils.admin.companies.list.invalidate(); utils.admin.stats.invalidate(); },
  });

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-brand-warning mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Acesso Restrito</h2>
            <p className="text-sm text-muted-foreground">Esta área é exclusiva para administradores Master.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const mrr = stats?.totalMrr ?? 0;
  const activeCount = stats?.activeCompanies ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const churnRate = stats?.totalCompanies ? Math.round(((stats.totalCompanies - stats.activeCompanies) / stats.totalCompanies) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Master Admin</h1>
              <p className="text-muted-foreground mt-2">Gestão centralizada de empresas, planos e receita do SaaS.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Nova Empresa
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border/30 backdrop-blur-sm">
                <DialogHeader>
                  <DialogTitle>Adicionar Empresa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Nome da Empresa *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: TechCorp LTDA" className="mt-1 bg-input border-border/50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Plano</Label>
                    <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                      <SelectTrigger className="mt-1 bg-input border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial (Gratuito)</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium">Max Assentos</Label>
                      <Input type="number" value={form.maxSeats} onChange={(e) => setForm({ ...form, maxSeats: e.target.value })} className="mt-1 bg-input border-border/50" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">MRR (R$)</Label>
                      <Input type="number" value={form.mrrValue} onChange={(e) => setForm({ ...form, mrrValue: e.target.value })} placeholder="2500" className="mt-1 bg-input border-border/50" />
                    </div>
                  </div>
                  <Button onClick={() => {
                    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
                    createMutation.mutate({ name: form.name, plan: form.plan as any, maxSeats: parseInt(form.maxSeats) || 3, monthlyPrice: form.mrrValue });
                  }} disabled={createMutation.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500 hover:scale-105">
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar Empresa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Financial KPIs */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "MRR", value: `R$ ${Number(mrr).toLocaleString("pt-BR")}`, icon: DollarSign, color: "from-green-500 to-green-600", trend: "+12%" },
            { title: "Empresas Ativas", value: String(activeCount), icon: Building2, color: "from-blue-500 to-blue-600", trend: "+3" },
            { title: "Total Usuários", value: String(totalUsers), icon: Users, color: "from-purple-500 to-purple-600", trend: "+8" },
            { title: "Churn Rate", value: `${churnRate}%`, icon: Activity, color: churnRate > 5 ? "from-red-500 to-red-600" : "from-green-500 to-green-600", trend: churnRate > 5 ? "-2%" : "Saudável" },
          ].map((kpi, idx) => (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
              <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.value}</p>
                    <p className="text-xs text-brand-success mt-2">{kpi.trend}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color} opacity-10`}>
                    <kpi.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Companies Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-xl font-bold">Empresas Clientes</h2>
              <p className="text-sm text-muted-foreground mt-1">Gerencie seus clientes SaaS e seus planos</p>
            </div>
            <div className="divide-y divide-border/30">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-10">
                  <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                </div>
              ) : (
                companies.map((company: any, idx: number) => {
                  const plan = planConfig[company.plan] || planConfig.trial;
                  return (
                    <motion.div key={company.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 hover:bg-card/50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-500 opacity-20 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground truncate">{company.name}</span>
                            <Badge className={`${plan.bg} ${plan.color} border-0 text-[10px]`}>{plan.label}</Badge>
                            {!company.isActive && <Badge className="bg-brand-danger/15 text-brand-danger border-0 text-[10px]">Suspenso</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>Max {company.maxSeats} assentos</span>
                            <span>Criada em {new Date(company.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">R$ {company.monthlyPrice || "—"}</p>
                            <p className="text-[10px] text-muted-foreground">MRR</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-primary/10" onClick={() => toggleMutation.mutate({ id: company.id, status: company.isActive ? "suspended" : "active" })}>
                            {company.isActive ? "Suspender" : "Ativar"}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-brand-danger hover:bg-red-500/10" onClick={() => { if (confirm("Remover empresa?")) deleteMutation.mutate({ id: company.id }); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>

        {/* Payment Integration Note */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Integração de Pagamento</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O sistema está preparado para integração com gateway de pagamento (Stripe, Mercado Pago, etc.) para cobrança automática via link de pagamento. Os campos de MRR e plano já estão estruturados para essa funcionalidade.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
