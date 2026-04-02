import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  Gauge,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data - will be replaced with real tRPC queries
const revenueData = [
  { month: "Jan", atual: 42000, meta: 50000 },
  { month: "Fev", atual: 48000, meta: 50000 },
  { month: "Mar", atual: 55000, meta: 55000 },
  { month: "Abr", atual: 52000, meta: 60000 },
  { month: "Mai", atual: 67000, meta: 65000 },
  { month: "Jun", atual: 72000, meta: 70000 },
];

const pipelineData = [
  { stage: "Prospecção", value: 12 },
  { stage: "Qualificação", value: 8 },
  { stage: "Proposta", value: 5 },
  { stage: "Negociação", value: 3 },
  { stage: "Fechamento", value: 2 },
];

const thermometerZones = [
  { label: "Prospecção", score: 72, status: "good" as const, action: "Manter ritmo" },
  { label: "Qualificação", score: 45, status: "warning" as const, action: "Acelerar" },
  { label: "Conversão", score: 88, status: "good" as const, action: "Manter ritmo" },
  { label: "Ticket Médio", score: 34, status: "danger" as const, action: "Focar aqui" },
  { label: "Retenção", score: 61, status: "warning" as const, action: "Atenção" },
];

function getStatusColor(status: "good" | "warning" | "danger") {
  switch (status) {
    case "good": return "text-brand-success";
    case "warning": return "text-brand-warning";
    case "danger": return "text-brand-danger";
  }
}

function getStatusBg(status: "good" | "warning" | "danger") {
  switch (status) {
    case "good": return "bg-brand-success/15";
    case "warning": return "bg-brand-warning/15";
    case "danger": return "bg-brand-danger/15";
  }
}

function getProgressColor(score: number) {
  if (score >= 70) return "[&>div]:bg-brand-success";
  if (score >= 50) return "[&>div]:bg-brand-warning";
  return "[&>div]:bg-brand-danger";
}

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cockpit de Comando</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visão estratégica da sua operação comercial em tempo real.
            </p>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Receita Mensal",
              value: "R$ 72.000",
              change: "+12%",
              trend: "up" as const,
              icon: DollarSign,
            },
            {
              title: "Leads Ativos",
              value: "148",
              change: "+23",
              trend: "up" as const,
              icon: Users,
            },
            {
              title: "Taxa de Conversão",
              value: "18,5%",
              change: "-2,1%",
              trend: "down" as const,
              icon: Target,
            },
            {
              title: "Pipeline Total",
              value: "R$ 340K",
              change: "+8%",
              trend: "up" as const,
              icon: Activity,
            },
          ].map((kpi, i) => (
            <motion.div key={kpi.title} {...fadeIn} transition={{ delay: i * 0.06 }}>
              <Card className="metric-card border-border/30 bg-card/80">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <kpi.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-medium ${
                        kpi.trend === "up" ? "text-brand-success" : "text-brand-danger"
                      }`}
                    >
                      {kpi.trend === "up" ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{kpi.title}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Thermometer + Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Thermometer */}
          <motion.div {...fadeIn} transition={{ delay: 0.2 }} className="lg:col-span-2">
            <Card className="border-border/30 bg-card/80 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">
                    Termômetro de Gestão
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Onde acelerar, reduzir e focar
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {thermometerZones.map((zone) => (
                  <div key={zone.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">
                        {zone.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${getStatusColor(zone.status)}`}>
                          {zone.score}%
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-5 border-0 ${getStatusBg(zone.status)} ${getStatusColor(zone.status)}`}
                        >
                          {zone.status === "danger" && <Flame className="w-2.5 h-2.5 mr-0.5" />}
                          {zone.status === "warning" && <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />}
                          {zone.status === "good" && <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />}
                          {zone.action}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={zone.score}
                      className={`h-2 bg-muted/50 ${getProgressColor(zone.score)}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Chart */}
          <motion.div {...fadeIn} transition={{ delay: 0.25 }} className="lg:col-span-3">
            <Card className="border-border/30 bg-card/80 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      Receita vs Meta
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Últimos 6 meses
                    </p>
                  </div>
                  <Badge variant="outline" className="text-brand-success border-brand-success/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18% YoY
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.72 0.19 55)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.72 0.19 55)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.018 255 / 30%)" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "oklch(0.60 0.015 250)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "oklch(0.60 0.015 250)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.185 0.028 255)",
                          border: "1px solid oklch(0.30 0.018 255 / 40%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "oklch(0.93 0.008 250)",
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="meta"
                        stroke="oklch(0.45 0.015 255)"
                        strokeDasharray="4 4"
                        fill="none"
                        strokeWidth={1.5}
                      />
                      <Area
                        type="monotone"
                        dataKey="atual"
                        stroke="oklch(0.72 0.19 55)"
                        fill="url(#colorAtual)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pipeline + AGC Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pipeline */}
          <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Pipeline por Estágio</CardTitle>
                <p className="text-xs text-muted-foreground">Distribuição de deals ativos</p>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pipelineData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.018 255 / 20%)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "oklch(0.60 0.015 250)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="stage"
                        tick={{ fontSize: 11, fill: "oklch(0.60 0.015 250)" }}
                        axisLine={false}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.185 0.028 255)",
                          border: "1px solid oklch(0.30 0.018 255 / 40%)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "oklch(0.93 0.008 250)",
                        }}
                      />
                      <Bar dataKey="value" fill="oklch(0.72 0.19 55)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AGC Alerts */}
          <motion.div {...fadeIn} transition={{ delay: 0.35 }}>
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-semibold">
                    Alertas do AGC
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  Agente de Governança Comercial
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    severity: "critical" as const,
                    title: "Taxa de follow-up abaixo de 40%",
                    time: "há 2h",
                    desc: "12 leads sem contato há mais de 5 dias.",
                  },
                  {
                    severity: "warning" as const,
                    title: "Pipeline concentrado em prospecção",
                    time: "há 4h",
                    desc: "60% dos deals estão no topo do funil.",
                  },
                  {
                    severity: "info" as const,
                    title: "Campanha outbound com boa performance",
                    time: "há 6h",
                    desc: "Taxa de resposta de 8,2% acima da média.",
                  },
                ].map((alert, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border transition-colors ${
                      alert.severity === "critical"
                        ? "border-brand-danger/30 bg-brand-danger/5"
                        : alert.severity === "warning"
                          ? "border-brand-warning/30 bg-brand-warning/5"
                          : "border-border/30 bg-card/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 border-0 ${
                              alert.severity === "critical"
                                ? "bg-brand-danger/15 text-brand-danger"
                                : alert.severity === "warning"
                                  ? "bg-brand-warning/15 text-brand-warning"
                                  : "bg-primary/10 text-primary"
                            }`}
                          >
                            {alert.severity === "critical" ? "Crítico" : alert.severity === "warning" ? "Atenção" : "Info"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                        </div>
                        <p className="text-xs font-medium text-foreground">{alert.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{alert.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
