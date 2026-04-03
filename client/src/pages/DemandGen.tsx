import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Rocket, Zap, Globe, Mail, Phone, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const channels = [
  { icon: Globe, name: "Inbound Marketing", description: "SEO, conteúdo, blog, redes sociais", status: "active", gradient: "from-blue-500 to-blue-600" },
  { icon: Mail, name: "Email Marketing", description: "Campanhas de nutrição e prospecção", status: "setup", gradient: "from-yellow-500 to-yellow-600" },
  { icon: Phone, name: "Outbound", description: "Cold calling, social selling, prospecção ativa", status: "active", gradient: "from-green-500 to-green-600" },
  { icon: Users, name: "Indicações", description: "Programa de referral e parcerias", status: "planned", gradient: "from-purple-500 to-purple-600" },
  { icon: Zap, name: "Eventos", description: "Webinars, workshops, palestras", status: "planned", gradient: "from-orange-500 to-orange-600" },
];

export default function DemandGen() {
  const { data: leads = [] } = trpc.leads.list.useQuery({});
  const sourceCount = leads.reduce((acc: Record<string, number>, l: any) => { acc[l.source || "direto"] = (acc[l.source || "direto"] || 0) + 1; return acc; }, {});

  const statusConfig: Record<string, { label: string; gradient: string }> = {
    active: { label: "Ativo", gradient: "from-green-500 to-green-600" },
    setup: { label: "Configurando", gradient: "from-yellow-500 to-yellow-600" },
    planned: { label: "Planejado", gradient: "from-blue-500 to-blue-600" },
  };

  const metrics = [
    { label: "Leads Este Mês", value: leads.length, icon: TrendingUp, color: "from-blue-500 to-blue-600" },
    { label: "Fontes Ativas", value: Object.keys(sourceCount).length, icon: Rocket, color: "from-green-500 to-green-600" },
    { label: "CAC Estimado", value: "-", icon: Zap, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Geração de Demanda</h1>
            <p className="text-muted-foreground mt-2">Canais de aquisição e estratégias de geração de leads.</p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
              <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                    <p className="text-3xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} opacity-10`}>
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Acquisition Channels */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Canais de Aquisição</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
              {channels.map((ch, idx) => {
                const config = statusConfig[ch.status];
                const Icon = ch.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <div className="group relative overflow-hidden rounded-lg border border-border/30 bg-card/50 p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${ch.gradient} opacity-10`}>
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-[10px]`}>{config.label}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{ch.name}</h3>
                      <p className="text-xs text-muted-foreground">{ch.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Source Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-lg font-bold">Distribuição de Leads por Fonte</h2>
            </div>
            <div className="p-6">
              {Object.entries(sourceCount).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Sem dados de origem</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(sourceCount).map(([source, count], idx: number) => {
                    const total = Object.values(sourceCount).reduce((a: any, b: any) => a + b, 0);
                    const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium capitalize">{source}</p>
                          <p className="text-sm font-semibold">{count} leads ({percentage.toFixed(1)}%)</p>
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
      </div>
    </DashboardLayout>
  );
}
