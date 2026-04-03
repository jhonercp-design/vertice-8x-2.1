import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Target, BarChart3, PieChart } from "lucide-react";

export default function Reports() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: pipeline = [] } = trpc.dashboard.pipeline.useQuery();
  const { data: leadsByStatus = [] } = trpc.dashboard.leadsByStatus.useQuery();
  const { data: leads = [] } = trpc.leads.list.useQuery({});

  const totalLeads = Number(kpis?.totalLeads || 0);
  const wonDeals = Number(kpis?.wonDeals || 0);
  const totalRevenue = Number(kpis?.totalRevenue || 0);
  const conversionRate = kpis?.conversionRate || 0;

  const sourceDistribution = leads.reduce((acc: Record<string, number>, lead: any) => {
    const src = lead.source || "Direto";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  const metrics = [
    { label: "Total Leads", value: totalLeads, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Receita Total", value: `R$ ${totalRevenue.toLocaleString("pt-BR")}`, icon: DollarSign, color: "from-green-500 to-green-600" },
    { label: "Deals Ganhos", value: wonDeals, icon: Target, color: "from-purple-500 to-purple-600" },
    { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: TrendingUp, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground mt-2">Visão analítica completa da operação comercial.</p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
              <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} opacity-10`}>
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline */}
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Pipeline por Estágio</h2>
            </div>
            <div className="p-6">
              {pipeline.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados de pipeline</p>
              ) : (
                <div className="space-y-3">
                  {pipeline.map((stage: any, idx: number) => {
                    const total = pipeline.reduce((sum: number, s: any) => sum + Number(s.value || 0), 0);
                    const percentage = total > 0 ? (Number(stage.value) / total) * 100 : 0;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium capitalize">{stage.stage}</p>
                          <p className="text-sm font-semibold">R$ {Number(stage.value).toLocaleString("pt-BR")}</p>
                        </div>
                        <div className="w-full bg-border/30 rounded-full h-2">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Source Distribution */}
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Distribuição de Origem</h2>
            </div>
            <div className="p-6">
              {Object.entries(sourceDistribution).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados de origem</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(sourceDistribution).map(([source, count], idx: number) => {
                    const total = Object.values(sourceDistribution).reduce((a: any, b: any) => a + b, 0);
                    const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{source}</p>
                          <p className="text-sm font-semibold">{count} leads</p>
                        </div>
                        <div className="w-full bg-border/30 rounded-full h-2">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${percentage}%` }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Leads by Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-lg font-bold">Leads por Status</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              {leadsByStatus.map((status: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                  <div className="rounded-lg border border-border/30 bg-card/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1 capitalize">{status.status}</p>
                    <p className="text-2xl font-bold">{status.count}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
