import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  TrendingUp,
  Phone,
  Mail,
  Target,
  Eye,
} from "lucide-react";

const alerts = [
  {
    id: 1,
    severity: "critical" as const,
    category: "Follow-up",
    title: "12 leads sem contato há mais de 5 dias",
    description: "A taxa de follow-up caiu para 38%. Leads qualificados estão esfriando. Ação imediata necessária para retomar contato.",
    recommendation: "Priorize os 5 leads com maior valor de deal e faça contato hoje. Use o script de reativação do Playbook.",
    time: "14:00",
    acknowledged: false,
  },
  {
    id: 2,
    severity: "warning" as const,
    category: "Pipeline",
    title: "Pipeline concentrado no topo do funil",
    description: "60% dos deals estão em fase de prospecção. Apenas 8% estão em negociação. Risco de gap de receita nos próximos 30 dias.",
    recommendation: "Foque em qualificar os 15 leads em prospecção. Aplique o framework BANT para filtrar rapidamente.",
    time: "12:00",
    acknowledged: false,
  },
  {
    id: 3,
    severity: "info" as const,
    category: "Campanha",
    title: "Campanha outbound com taxa de resposta de 8,2%",
    description: "A campanha 'C-Level Tech' está performando 3x acima da média do setor. Considere escalar o investimento.",
    recommendation: "Duplique o volume de envios mantendo a mesma segmentação. Teste variações do assunto para otimizar.",
    time: "10:00",
    acknowledged: true,
  },
  {
    id: 4,
    severity: "warning" as const,
    category: "Calls",
    title: "Qualidade das calls de discovery abaixo do esperado",
    description: "Análise das últimas 8 calls mostra que apenas 25% seguiram o framework SPIN completo. Perguntas de implicação estão sendo puladas.",
    recommendation: "Revise o playbook de discovery com a equipe. Foque nas perguntas de implicação e necessidade de retorno.",
    time: "08:00",
    acknowledged: false,
  },
];

const metrics = [
  { label: "Alertas Hoje", value: "4", icon: AlertTriangle, color: "text-brand-warning" },
  { label: "Críticos", value: "1", icon: ShieldCheck, color: "text-brand-danger" },
  { label: "Resolvidos", value: "1", icon: CheckCircle2, color: "text-brand-success" },
  { label: "Próxima Auditoria", value: "15:00", icon: Clock, color: "text-primary" },
];

function getSeverityConfig(severity: "critical" | "warning" | "info") {
  switch (severity) {
    case "critical":
      return {
        icon: AlertTriangle,
        label: "Crítico",
        bg: "bg-brand-danger/10",
        border: "border-brand-danger/30",
        text: "text-brand-danger",
        badgeBg: "bg-brand-danger/15",
      };
    case "warning":
      return {
        icon: Eye,
        label: "Atenção",
        bg: "bg-brand-warning/10",
        border: "border-brand-warning/30",
        text: "text-brand-warning",
        badgeBg: "bg-brand-warning/15",
      };
    case "info":
      return {
        icon: Info,
        label: "Informativo",
        bg: "bg-primary/5",
        border: "border-border/30",
        text: "text-primary",
        badgeBg: "bg-primary/10",
      };
  }
}

export default function AGC() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Agente de Governança Comercial
              </h1>
              <p className="text-xs text-muted-foreground">
                Auditoria contínua da operação — 7h às 19h
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-brand-success/30 text-brand-success gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-success live-indicator" />
            AGC Ativo
          </Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
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

        {/* Alerts */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Alertas de Hoje</h2>
          {alerts.map((alert, i) => {
            const config = getSeverityConfig(alert.severity);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className={`${config.border} ${config.bg} overflow-hidden`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={`${config.badgeBg} ${config.text} border-0 text-[10px]`}>
                            <config.icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40">
                            {alert.category}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {alert.time}
                          </span>
                          {alert.acknowledged && (
                            <Badge className="bg-brand-success/15 text-brand-success border-0 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Reconhecido
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm text-foreground mb-1">
                          {alert.title}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          {alert.description}
                        </p>
                        <div className="p-3 rounded-lg bg-background/50 border border-border/20">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                            Recomendação do AGC
                          </p>
                          <p className="text-xs text-foreground leading-relaxed">
                            {alert.recommendation}
                          </p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <div className="flex md:flex-col gap-2 shrink-0">
                          <Button size="sm" variant="outline" className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10">
                            Reconhecer
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            Ver Detalhes
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
