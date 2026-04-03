import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, Target, Zap } from "lucide-react";

export default function Forecast() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: pipeline = [] } = trpc.dashboard.pipeline.useQuery();

  const pipelineValue = Number(kpis?.pipelineValue || 0);
  const wonValue = Number(kpis?.totalRevenue || 0);
  const conversionRate = kpis?.conversionRate || 0;
  const weightedForecast = pipeline.reduce((acc: number, stage: any) => {
    const prob: Record<string, number> = { prospecting: 10, qualification: 25, proposal: 50, negotiation: 70, closing: 90, won: 100, lost: 0 };
    return acc + (Number(stage.value || 0) * (prob[stage.stage] || 0) / 100);
  }, 0);

  const scenarios = [
    { label: "Conservador", multiplier: 0.7, color: "from-yellow-500 to-yellow-600", icon: Target },
    { label: "Realista", multiplier: 1.0, color: "from-primary to-orange-500", icon: TrendingUp },
    { label: "Otimista", multiplier: 1.3, color: "from-green-500 to-green-600", icon: Zap },
  ];

  const metrics = [
    { label: "Pipeline Total", value: `R$ ${pipelineValue.toLocaleString("pt-BR")}`, icon: DollarSign, color: "from-blue-500 to-blue-600" },
    { label: "Receita Fechada", value: `R$ ${wonValue.toLocaleString("pt-BR")}`, icon: TrendingUp, color: "from-green-500 to-green-600" },
    { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: Target, color: "from-purple-500 to-purple-600" },
    { label: "Forecast Ponderado", value: `R$ ${weightedForecast.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`, icon: Calculator, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Forecast de Vendas</h1>
            <p className="text-muted-foreground mt-2">Projeção de receita baseada no pipeline atual.</p>
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

        {/* Scenarios */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-xl font-bold">Cenários de Projeção</h2>
              <p className="text-sm text-muted-foreground mt-1">Diferentes cenários baseados no forecast ponderado</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
              {scenarios.map((scenario, idx) => {
                const projectedValue = weightedForecast * scenario.multiplier;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                    <div className="group relative overflow-hidden rounded-lg border border-border/30 bg-card/50 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${scenario.color} opacity-10`}>
                          <scenario.icon className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold">{scenario.label}</h3>
                      </div>
                      <p className="text-3xl font-bold mb-1">R$ {projectedValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground">Multiplicador: {scenario.multiplier}x</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Pipeline by Stage */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-xl font-bold">Pipeline por Estágio</h2>
            </div>
            <div className="divide-y divide-border/30">
              {pipeline.map((stage: any, idx: number) => {
                const percentage = pipelineValue > 0 ? (Number(stage.value) / pipelineValue) * 100 : 0;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 hover:bg-card/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm capitalize">{stage.stage}</p>
                      <p className="text-sm font-semibold">R$ {Number(stage.value).toLocaleString("pt-BR")}</p>
                    </div>
                    <div className="w-full bg-border/30 rounded-full h-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% do pipeline</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
