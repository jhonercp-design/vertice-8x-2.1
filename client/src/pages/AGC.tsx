import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Info, Clock, Eye, Loader2, Zap, TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

function getSeverityConfig(severity: string) {
  switch (severity) {
    case "critical":
      return { icon: AlertTriangle, label: "Crítico", bg: "bg-brand-danger/10", border: "border-brand-danger/30", text: "text-brand-danger", badgeBg: "bg-brand-danger/15" };
    case "warning":
      return { icon: Eye, label: "Atenção", bg: "bg-brand-warning/10", border: "border-brand-warning/30", text: "text-brand-warning", badgeBg: "bg-brand-warning/15" };
    default:
      return { icon: Info, label: "Informativo", bg: "bg-primary/5", border: "border-border/30", text: "text-primary", badgeBg: "bg-primary/10" };
  }
}

export default function AGC() {
  const utils = trpc.useUtils();
  const { data: alerts = [], isLoading } = trpc.agc.alerts.useQuery();

  const acknowledgeMutation = trpc.agc.acknowledge.useMutation({
    onSuccess: () => { utils.agc.alerts.invalidate(); toast.success("Alerta reconhecido!"); },
  });

  const generateMutation = trpc.agc.generate.useMutation({
    onSuccess: (data) => {
      utils.agc.alerts.invalidate();
      toast.success(`${data.generated} alertas gerados pela IA!`);
    },
    onError: () => toast.error("Erro ao gerar alertas"),
  });

  const criticalCount = alerts.filter((a: any) => a.severity === "critical" && !a.acknowledged).length;
  const warningCount = alerts.filter((a: any) => a.severity === "warning" && !a.acknowledged).length;
  const resolvedCount = alerts.filter((a: any) => a.acknowledged).length;

  const metrics = [
    { label: "Total Alertas", value: String(alerts.length), icon: AlertTriangle, color: "from-orange-500 to-orange-600" },
    { label: "Críticos", value: String(criticalCount), icon: ShieldCheck, color: "from-red-500 to-red-600" },
    { label: "Resolvidos", value: String(resolvedCount), icon: CheckCircle2, color: "from-green-500 to-green-600" },
    { label: "Atenção", value: String(warningCount), icon: Clock, color: "from-yellow-500 to-yellow-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AGC</h1>
              <p className="text-muted-foreground mt-2">Agente de Governança Comercial — auditoria contínua da operação (7h-19h).</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Gerar Auditoria IA
              </button>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 border gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Ativo
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <motion.div key={metric.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
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

        {/* Alerts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-xl font-bold">Alertas de Governança</h2>
              <p className="text-sm text-muted-foreground mt-1">Recomendações de IA para otimização operacional</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-brand-success mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Nenhum alerta no momento. Operação em dia!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {alerts.map((alert: any, idx: number) => {
                  const config = getSeverityConfig(alert.severity);
                  return (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`p-4 hover:bg-card/50 transition-colors group ${alert.acknowledged ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                          <config.icon className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-foreground">{alert.title}</h3>
                            <Badge className={`${config.badgeBg} ${config.text} border-0 text-[10px]`}>{config.label}</Badge>
                            {alert.acknowledged && <Badge className="bg-green-500/10 text-green-500 border-0 text-[10px]">Reconhecido</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(alert.createdAt).toLocaleString("pt-BR")}</p>
                        </div>
                        {!alert.acknowledged && (
                          <button onClick={() => acknowledgeMutation.mutate({ id: alert.id })} disabled={acknowledgeMutation.isPending} className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0">
                            {acknowledgeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reconhecer"}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
