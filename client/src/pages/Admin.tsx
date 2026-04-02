import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import {
  Crown,
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const mockCompanies = [
  { id: 1, name: "TechCorp LTDA", plan: "professional", seats: "5/10", status: "active", mrr: 2500, users: 5 },
  { id: 2, name: "DataFlow S.A.", plan: "enterprise", seats: "12/25", status: "active", mrr: 5000, users: 12 },
  { id: 3, name: "CloudBase Inc", plan: "starter", seats: "2/3", status: "active", mrr: 990, users: 2 },
  { id: 4, name: "SaaS Brasil", plan: "trial", seats: "1/3", status: "active", mrr: 0, users: 1 },
  { id: 5, name: "Fintech Pro", plan: "professional", seats: "8/10", status: "suspended", mrr: 0, users: 8 },
];

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: "Trial", color: "text-muted-foreground", bg: "bg-muted/50" },
  starter: { label: "Starter", color: "text-blue-400", bg: "bg-blue-400/15" },
  professional: { label: "Professional", color: "text-primary", bg: "bg-primary/15" },
  enterprise: { label: "Enterprise", color: "text-brand-success", bg: "bg-brand-success/15" },
};

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-brand-warning mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Acesso Restrito</h2>
            <p className="text-sm text-muted-foreground">
              Esta área é exclusiva para administradores Master.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Master Admin</h1>
            <p className="text-xs text-muted-foreground">
              Gestão de empresas, licenças e faturamento
            </p>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "MRR", value: "R$ 8.490", icon: DollarSign, change: "+12%", color: "text-brand-success" },
            { title: "Empresas Ativas", value: "4", icon: Building2, change: "+1", color: "text-primary" },
            { title: "Total Usuários", value: "28", icon: Users, change: "+5", color: "text-blue-400" },
            { title: "Churn Rate", value: "2,1%", icon: Activity, change: "-0,5%", color: "text-brand-success" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="border-border/30 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <kpi.icon className="w-4 h-4 text-muted-foreground" />
                    <span className={`text-[10px] font-medium ${kpi.color}`}>{kpi.change}</span>
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
              <CardTitle className="text-sm font-semibold">Empresas</CardTitle>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground"
                onClick={() => toast("Funcionalidade em breve")}
              >
                <Plus className="w-4 h-4 mr-1" /> Nova Empresa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCompanies.map((company) => {
                const plan = planConfig[company.plan];
                return (
                  <div
                    key={company.id}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border/20 hover:border-primary/20 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {company.name}
                        </span>
                        <Badge className={`${plan.bg} ${plan.color} border-0 text-[10px]`}>
                          {plan.label}
                        </Badge>
                        {company.status === "suspended" && (
                          <Badge className="bg-brand-danger/15 text-brand-danger border-0 text-[10px]">
                            Suspenso
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                        <span>{company.seats} assentos</span>
                        <span>{company.users} usuários</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden md:block">
                      <p className="text-sm font-bold text-foreground">
                        {company.mrr > 0 ? `R$ ${company.mrr.toLocaleString("pt-BR")}` : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">MRR</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
