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
  Crown, Building2, Users, DollarSign, Activity, Plus, AlertTriangle, Loader2, Trash2, MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: "Trial", color: "text-muted-foreground", bg: "bg-muted/50" },
  starter: { label: "Starter", color: "text-blue-400", bg: "bg-blue-400/15" },
  professional: { label: "Professional", color: "text-primary", bg: "bg-primary/15" },
  enterprise: { label: "Enterprise", color: "text-brand-success", bg: "bg-brand-success/15" },
};

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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Master Admin</h1>
            <p className="text-xs text-muted-foreground">Gestão de empresas, licenças e faturamento do SaaS</p>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "MRR", value: `R$ ${Number(mrr).toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-brand-success" },
            { title: "Empresas Ativas", value: String(activeCount), icon: Building2, color: "text-primary" },
            { title: "Total Usuários", value: String(totalUsers), icon: Users, color: "text-blue-400" },
            { title: "Churn Rate", value: `${churnRate}%`, icon: Activity, color: churnRate > 5 ? "text-brand-danger" : "text-brand-success" },
          ].map((kpi, i) => (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/30 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <kpi.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-[11px] text-muted-foreground">{kpi.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Companies Table */}
        <Card className="border-border/30 bg-card/80">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Empresas Clientes</CardTitle>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Nova Empresa</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader><DialogTitle>Nova Empresa</DialogTitle></DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div><Label>Nome da Empresa *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: TechCorp LTDA" /></div>
                    <div>
                      <Label>Plano</Label>
                      <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Trial (Gratuito)</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Max Assentos</Label><Input type="number" value={form.maxSeats} onChange={(e) => setForm({ ...form, maxSeats: e.target.value })} /></div>
                    <div><Label>MRR (R$)</Label><Input type="number" value={form.mrrValue} onChange={(e) => setForm({ ...form, mrrValue: e.target.value })} placeholder="Ex: 2500" /></div>
                    <Button onClick={() => {
                      if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
                      createMutation.mutate({ name: form.name, plan: form.plan as any, maxSeats: parseInt(form.maxSeats) || 3, monthlyPrice: form.mrrValue });
                    }} disabled={createMutation.isPending} className="bg-primary text-primary-foreground">
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                      Criar Empresa
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : companies.length === 0 ? (
              <div className="text-center py-10">
                <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {companies.map((company: any) => {
                  const plan = planConfig[company.plan] || planConfig.trial;
                  return (
                    <div key={company.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/20 hover:border-primary/20 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{company.name}</span>
                          <Badge className={`${plan.bg} ${plan.color} border-0 text-[10px]`}>{plan.label}</Badge>
                          {!company.isActive && <Badge className="bg-brand-danger/15 text-brand-danger border-0 text-[10px]">Suspenso</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          <span>Max {company.maxSeats} assentos</span>
                          <span>Criada em {new Date(company.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden md:block">
                        <p className="text-sm font-bold text-foreground">{'—'}</p>
                        <p className="text-[10px] text-muted-foreground">MRR</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleMutation.mutate({ id: company.id, status: company.isActive ? "suspended" : "active" })}>
                          {company.isActive ? "Suspender" : "Ativar"}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-brand-danger" onClick={() => { if (confirm("Remover empresa?")) deleteMutation.mutate({ id: company.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Integration Note */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Integração de Pagamento</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  O sistema está preparado para integração com gateway de pagamento (Stripe, Mercado Pago, etc.) para cobrança automática via link de pagamento. Os campos de MRR e plano já estão estruturados para essa funcionalidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
