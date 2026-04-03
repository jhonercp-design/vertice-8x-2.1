import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Handshake, Star, AlertTriangle, TrendingUp, Users } from "lucide-react";

export default function PostSales() {
  const { data: leads = [] } = trpc.leads.list.useQuery({});
  const wonLeads = leads.filter((l: any) => l.status === "won");
  const { data: deals = [] } = trpc.deals.list.useQuery();
  const wonDeals = deals.filter((d: any) => d.stage === "won");

  const totalRecurring = wonDeals.reduce((acc: number, d: any) => acc + Number(d.value || 0), 0);

  const metrics = [
    { label: "Clientes Ativos", value: wonLeads.length, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Receita Recorrente", value: `R$ ${totalRecurring.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "from-green-500 to-green-600" },
    { label: "NPS", value: "-", icon: Star, color: "from-yellow-500 to-yellow-600" },
    { label: "Risco de Churn", value: "0", icon: AlertTriangle, color: "from-red-500 to-red-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Pós-Venda</h1>
            <p className="text-muted-foreground mt-2">Gestão de clientes ativos, retenção e expansão.</p>
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

        {/* Active Customers */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-2">
              <Handshake className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Clientes Ganhos</h2>
            </div>
            <div className="p-6">
              {wonLeads.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum cliente ativo</p>
              ) : (
                <div className="space-y-3">
                  {wonLeads.map((lead: any, idx: number) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-card/50 hover:bg-card/70 transition-colors">
                        <div>
                          <p className="font-semibold text-sm">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">Ativo</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
