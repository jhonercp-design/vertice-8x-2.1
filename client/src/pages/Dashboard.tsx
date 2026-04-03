import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, Target, Activity,
  AlertTriangle, CheckCircle2, Clock, Flame, Gauge, ShieldCheck, Loader2, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart,
} from "recharts";

function getProgressColor(score: number) {
  if (score >= 70) return "[&>div]:bg-brand-success";
  if (score >= 50) return "[&>div]:bg-brand-warning";
  return "[&>div]:bg-brand-danger";
}

function getScoreColor(score: number) {
  if (score >= 70) return "text-brand-success";
  if (score >= 50) return "text-brand-warning";
  return "text-brand-danger";
}

function getScoreBg(score: number) {
  if (score >= 70) return "bg-brand-success/15";
  if (score >= 50) return "bg-brand-warning/15";
  return "bg-brand-danger/15";
}

function getScoreAction(score: number) {
  if (score >= 70) return "Manter ritmo";
  if (score >= 50) return "Atenção";
  return "Focar aqui";
}

function getScoreIcon(score: number) {
  if (score >= 70) return CheckCircle2;
  if (score >= 50) return AlertTriangle;
  return Flame;
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const stageLabels: Record<string, string> = {
  prospecting: "Prospecção",
  qualification: "Qualificação",
  proposal: "Proposta",
  negotiation: "Negociação",
  closing: "Fechamento",
  won: "Ganho",
  lost: "Perdido",
};

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.kpis.useQuery();
  const { data: pipeline = [] } = trpc.dashboard.pipeline.useQuery();
  const { data: leadsByStatus = [] } = trpc.dashboard.leadsByStatus.useQuery();
  const { data: agcAlerts = [] } = trpc.agc.alerts.useQuery();

  const totalLeads = kpis?.totalLeads || 0;
  const totalRevenue = Number(kpis?.totalRevenue || 0);
  const conversionRate = kpis?.conversionRate || 0;
  const pipelineValue = Number(kpis?.pipelineValue || 0);

  const pipelineChart = pipeline.map((p: any) => ({
    stage: stageLabels[p.stage] || p.stage,
    value: Number(p.count),
  }));

  // Thermometer: compute scores from real data
  const statusCounts: Record<string, number> = {};
  leadsByStatus.forEach((s: any) => { statusCounts[s.status] = Number(s.count); });
  const totalL = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
  const prospectionScore = Math.min(100, Math.round(((statusCounts["new"] || 0) + (statusCounts["contacted"] || 0)) / totalL * 100 * 1.5));
  const qualificationScore = Math.min(100, Math.round((statusCounts["qualified"] || 0) / totalL * 100 * 3));
  const conversionScore = Math.min(100, Math.round(conversionRate * 5));
  const ticketScore = Math.min(100, Math.round(pipelineValue / Math.max(totalLeads, 1) / 1000));
  const retentionScore = Math.min(100, Math.round(((statusCounts["won"] || 0) / totalL) * 100 * 4));

  const thermometerZones = [
    { label: "Prospecção", score: totalLeads > 0 ? prospectionScore : 0 },
    { label: "Qualificação", score: totalLeads > 0 ? qualificationScore : 0 },
    { label: "Conversão", score: totalLeads > 0 ? conversionScore : 0 },
    { label: "Ticket Médio", score: totalLeads > 0 ? ticketScore : 0 },
    { label: "Retenção", score: totalLeads > 0 ? retentionScore : 0 },
  ];

  const recentAlerts = agcAlerts.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Cockpit de Comando</h1>
            <p className="text-muted-foreground mt-2">Visão estratégica da sua operação comercial em tempo real.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/30">
              <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
              <span className="text-sm font-medium">Ao vivo</span>
            </div>
            <div className="text-sm text-muted-foreground">Atualizado agora</div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards - Premium Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: "Receita Fechada", value: `R$ ${(totalRevenue / 1000).toFixed(0)}K`, trend: "+12%", color: "from-brand-orange to-orange-500" },
          { icon: Users, label: "Leads Ativos", value: totalLeads.toString(), trend: "+8%", color: "from-blue-500 to-blue-600" },
          { icon: Target, label: "Taxa de Conversão", value: `${conversionRate.toFixed(1)}%`, trend: "+3%", color: "from-brand-success to-green-500" },
          { icon: TrendingUp, label: "Pipeline Total", value: `R$ ${(pipelineValue / 1000).toFixed(0)}K`, trend: "+15%", color: "from-purple-500 to-purple-600" },
        ].map((kpi, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
            <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-5`} />
              </div>
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color} opacity-10`}>
                    <kpi.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-brand-success">
                    <ArrowUp className="w-3 h-3" />
                    {kpi.trend}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{kpi.value}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thermometer - Left */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-1">
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Gauge className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Termômetro de Gestão</h3>
                <p className="text-xs text-muted-foreground">Onde acelerar, reduzir e focar</p>
              </div>
            </div>
            <div className="space-y-4">
              {thermometerZones.map((zone, idx) => {
                const Icon = getScoreIcon(zone.score);
                return (
                  <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${getScoreColor(zone.score)}`} />
                        <span className="text-sm font-medium">{zone.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(zone.score)}`}>{zone.score}%</span>
                    </div>
                    <div className={`h-2 rounded-full bg-card/50 overflow-hidden ${getProgressColor(zone.score)}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${zone.score}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-gradient-to-r from-primary to-orange-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">{getScoreAction(zone.score)}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Pipeline Chart - Right */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg">Pipeline por Estágio</h3>
                <p className="text-xs text-muted-foreground">Distribuição de deals ativos</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">{pipelineChart.length} estágios</Badge>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineChart}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.19 55)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="oklch(0.72 0.19 55)" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.018 255 / 30%)" />
                <XAxis dataKey="stage" stroke="oklch(0.60 0.015 250)" style={{ fontSize: "12px" }} />
                <YAxis stroke="oklch(0.60 0.015 250)" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "oklch(0.185 0.028 255)", border: "1px solid oklch(0.30 0.018 255 / 60%)", borderRadius: "8px", color: "oklch(0.93 0.008 250)" }} />
                <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* AGC Alerts */}
      {recentAlerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Alertas AGC</h3>
                <p className="text-xs text-muted-foreground">Recomendações de gestão comercial</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="p-4 rounded-lg bg-card/50 border border-border/30 hover:border-primary/50 transition-colors">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-brand-warning flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
