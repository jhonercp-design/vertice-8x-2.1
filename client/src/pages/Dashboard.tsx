import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, Target, Activity,
  AlertTriangle, CheckCircle2, Clock, Flame, Gauge, ShieldCheck, Loader2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cockpit de Comando</h1>
            <p className="text-sm text-muted-foreground mt-1">Visão estratégica da sua operação comercial em tempo real.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary live-indicator" />
              Ao vivo
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Atualizado agora
            </Badge>
          </div>
        </div>

        {kpisLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Receita Fechada", value: totalRevenue > 0 ? `R$ ${totalRevenue.toLocaleString("pt-BR")}` : "R$ 0", icon: DollarSign },
                { title: "Leads Ativos", value: String(totalLeads), icon: Users },
                { title: "Taxa de Conversão", value: `${conversionRate}%`, icon: Target },
                { title: "Pipeline Total", value: pipelineValue > 0 ? `R$ ${(pipelineValue / 1000).toFixed(0)}K` : "R$ 0", icon: Activity },
              ].map((kpi, i) => (
                <motion.div key={kpi.title} {...fadeIn} transition={{ delay: i * 0.06 }}>
                  <Card className="metric-card border-border/30 bg-card/80">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <kpi.icon className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{kpi.title}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Thermometer + Pipeline Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="lg:col-span-2">
                <Card className="border-border/30 bg-card/80 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm font-semibold">Termômetro de Gestão</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground">Onde acelerar, reduzir e focar</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {thermometerZones.map((zone) => {
                      const Icon = getScoreIcon(zone.score);
                      return (
                        <div key={zone.label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">{zone.label}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold ${getScoreColor(zone.score)}`}>{zone.score}%</span>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border-0 ${getScoreBg(zone.score)} ${getScoreColor(zone.score)}`}>
                                <Icon className="w-2.5 h-2.5 mr-0.5" />
                                {getScoreAction(zone.score)}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={zone.score} className={`h-2 bg-muted/50 ${getProgressColor(zone.score)}`} />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="lg:col-span-3">
                <Card className="border-border/30 bg-card/80 h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Pipeline por Estágio</CardTitle>
                    <p className="text-xs text-muted-foreground">Distribuição de deals ativos</p>
                  </CardHeader>
                  <CardContent>
                    {pipelineChart.length === 0 ? (
                      <div className="text-center py-10"><p className="text-sm text-muted-foreground">Nenhum deal no pipeline ainda.</p></div>
                    ) : (
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={pipelineChart} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.018 255 / 20%)" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: "oklch(0.60 0.015 250)" }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "oklch(0.60 0.015 250)" }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip contentStyle={{ backgroundColor: "oklch(0.185 0.028 255)", border: "1px solid oklch(0.30 0.018 255 / 40%)", borderRadius: "8px", fontSize: "12px", color: "oklch(0.93 0.008 250)" }} />
                            <Bar dataKey="value" fill="oklch(0.72 0.19 55)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* AGC Alerts */}
            <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
              <Card className="border-border/30 bg-card/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Alertas do AGC</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">Agente de Governança Comercial</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentAlerts.length === 0 ? (
                    <div className="text-center py-6"><p className="text-sm text-muted-foreground">Nenhum alerta. Sua operação está saudável.</p></div>
                  ) : (
                    recentAlerts.map((alert: any) => (
                      <div key={alert.id} className={`p-3 rounded-lg border transition-colors ${alert.severity === "critical" ? "border-brand-danger/30 bg-brand-danger/5" : alert.severity === "warning" ? "border-brand-warning/30 bg-brand-warning/5" : "border-border/30 bg-card/50"}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 border-0 ${alert.severity === "critical" ? "bg-brand-danger/15 text-brand-danger" : alert.severity === "warning" ? "bg-brand-warning/15 text-brand-warning" : "bg-primary/10 text-primary"}`}>
                                {alert.severity === "critical" ? "Crítico" : alert.severity === "warning" ? "Atenção" : "Info"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{new Date(alert.createdAt).toLocaleString("pt-BR")}</span>
                            </div>
                            <p className="text-xs font-medium text-foreground">{alert.title}</p>
                            {alert.description && <p className="text-[11px] text-muted-foreground mt-0.5">{alert.description}</p>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
