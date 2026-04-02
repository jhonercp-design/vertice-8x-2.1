import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Info, Clock, Eye, Loader2, Zap,
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
    { label: "Total Alertas", value: String(alerts.length), icon: AlertTriangle, color: "text-brand-warning" },
    { label: "Críticos", value: String(criticalCount), icon: ShieldCheck, color: "text-brand-danger" },
    { label: "Resolvidos", value: String(resolvedCount), icon: CheckCircle2, color: "text-brand-success" },
    { label: "Atenção", value: String(warningCount), icon: Clock, color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Agente de Governança Comercial</h1>
              <p className="text-xs text-muted-foreground">Auditoria contínua da operação — 7h às 19h</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="bg-primary text-primary-foreground">
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Zap className="w-4 h-4 mr-1" />}
              Gerar Auditoria IA
            </Button>
            <Badge variant="outline" className="border-brand-success/30 text-brand-success gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-success live-indicator" />
              AGC Ativo
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/30 bg-card/80">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center">
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{m.value}</p>
                    <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Alertas</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-10">
              <ShieldCheck className="w-10 h-10 text-brand-success mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum alerta. Clique em "Gerar Auditoria IA" para analisar sua operação.</p>
            </div>
          ) : (
            alerts.map((alert: any, i: number) => {
              const config = getSeverityConfig(alert.severity);
              return (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className={`${config.border} ${config.bg} overflow-hidden`}>
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className={`${config.badgeBg} ${config.text} border-0 text-[10px]`}>
                              <config.icon className="w-3 h-3 mr-1" />{config.label}
                            </Badge>
                            {alert.category && <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40">{alert.category}</Badge>}
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {new Date(alert.createdAt).toLocaleString("pt-BR")}
                            </span>
                            {alert.acknowledged && (
                              <Badge className="bg-brand-success/15 text-brand-success border-0 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" /> Reconhecido</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">{alert.title}</h3>
                          {alert.description && <p className="text-xs text-muted-foreground leading-relaxed mb-3">{alert.description}</p>}
                          {alert.recommendation && (
                            <div className="p-3 rounded-lg bg-background/50 border border-border/20">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Recomendação do AGC</p>
                              <p className="text-xs text-foreground leading-relaxed">{alert.recommendation}</p>
                            </div>
                          )}
                        </div>
                        {!alert.acknowledged && (
                          <Button size="sm" variant="outline" className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 shrink-0" onClick={() => acknowledgeMutation.mutate({ id: alert.id })} disabled={acknowledgeMutation.isPending}>
                            Reconhecer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
