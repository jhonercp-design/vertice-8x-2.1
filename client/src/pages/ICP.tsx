import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Crosshair, Users, TrendingUp } from "lucide-react";

export default function ICP() {
  const { data: leads = [] } = trpc.leads.list.useQuery({});
  const icpDistribution = leads.reduce((acc: Record<string, number>, lead: any) => {
    const fit = lead.icpFit || "Sem classificação";
    acc[fit] = (acc[fit] || 0) + 1;
    return acc;
  }, {});

  const fitConfig: Record<string, { color: string; label: string; icon: any; gradient: string }> = {
    A: { color: "text-green-500", label: "Perfil Ideal", icon: TrendingUp, gradient: "from-green-500 to-green-600" },
    B: { color: "text-blue-500", label: "Bom Fit", icon: Users, gradient: "from-blue-500 to-blue-600" },
    C: { color: "text-yellow-500", label: "Fit Médio", icon: Crosshair, gradient: "from-yellow-500 to-yellow-600" },
    D: { color: "text-red-500", label: "Baixo Fit", icon: Users, gradient: "from-red-500 to-red-600" },
  };

  const totalLeads = leads.length;
  const qualifiedLeads = (icpDistribution["A"] || 0) + (icpDistribution["B"] || 0);
  const qualificationRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ICP Builder</h1>
            <p className="text-muted-foreground mt-2">Perfil de Cliente Ideal — classificação e análise de fit dos seus leads.</p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total de Leads", value: totalLeads, icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Leads Qualificados", value: qualifiedLeads, icon: TrendingUp, color: "from-green-500 to-green-600" },
            { label: "Taxa de Qualificação", value: `${qualificationRate}%`, icon: Crosshair, color: "from-purple-500 to-purple-600" },
          ].map((metric, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
              <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{metric.label}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} opacity-10`}>
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ICP Distribution */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-xl font-bold">Distribuição por Fit</h2>
              <p className="text-sm text-muted-foreground mt-1">Classificação de leads por aderência ao ICP</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              {["A", "B", "C", "D"].map((fit, idx) => {
                const config = fitConfig[fit];
                const count = icpDistribution[fit] || 0;
                const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <motion.div key={fit} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <div className="group relative overflow-hidden rounded-lg border border-border/30 bg-card/50 p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">Fit {fit}</h3>
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-[10px]`}>{config.label}</Badge>
                      </div>
                      <p className="text-3xl font-bold mb-1">{count}</p>
                      <div className="w-full bg-border/30 rounded-full h-2 mb-2">
                        <div className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`} style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground">{percentage}% do total</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
            <h3 className="text-lg font-bold mb-4">Insights de ICP</h3>
            <div className="space-y-3">
              {qualificationRate > 70 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Excelente taxa de qualificação. Seu pipeline está bem segmentado.</p>
                </div>
              )}
              {qualificationRate < 40 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <Crosshair className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Taxa de qualificação baixa. Considere refinar seu ICP e estratégia de prospecção.</p>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">Foco em leads Fit A e B para maximizar taxa de conversão e ROI.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
