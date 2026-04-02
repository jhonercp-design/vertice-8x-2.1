import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  Microscope,
  Building2,
  Rocket,
  Zap,
  Crown,
  ChevronRight,
} from "lucide-react";

const pillars = [
  {
    id: "anatomia",
    number: "01",
    title: "Anatomia",
    subtitle: "Diagnóstico Profundo",
    icon: Microscope,
    description: "Mapeamento completo da operação comercial. ICP, personas, análise de mercado e identificação de gaps de receita.",
    steps: [
      "Diagnóstico de Maturidade Comercial",
      "Mapeamento de ICP e Personas",
      "Análise de Mercado e Concorrência",
      "Identificação de GAP de Receita",
      "Relatório de Anatomia Comercial",
    ],
    status: "in_progress" as "locked" | "in_progress" | "completed",
    progress: 60,
    color: "oklch(0.72 0.19 55)",
  },
  {
    id: "arquitetura",
    number: "02",
    title: "Arquitetura",
    subtitle: "Estrutura Comercial",
    icon: Building2,
    description: "Construção da máquina comercial. Processos, playbooks, scripts e frameworks de vendas personalizados.",
    steps: [
      "Desenho do Processo Comercial",
      "Criação de Playbooks de Vendas",
      "Scripts de Prospecção e Qualificação",
      "Framework de Proposta de Valor",
      "Estrutura de Métricas e KPIs",
    ],
    status: "locked" as const,
    progress: 0,
    color: "oklch(0.58 0.16 250)",
  },
  {
    id: "ativacao",
    number: "03",
    title: "Ativação",
    subtitle: "Execução Estratégica",
    icon: Rocket,
    description: "Ativação de campanhas, automações e fluxos de prospecção. Inbound e outbound em operação.",
    steps: [
      "Configuração de Automações",
      "Lançamento de Campanhas Outbound",
      "Setup de Fluxos Inbound",
      "Integração de Canais (WhatsApp, Email)",
      "Treinamento da Equipe Comercial",
    ],
    status: "locked" as const,
    progress: 0,
    color: "oklch(0.65 0.17 155)",
  },
  {
    id: "aceleracao",
    number: "04",
    title: "Aceleração",
    subtitle: "Escala e Otimização",
    icon: Zap,
    description: "Otimização baseada em dados. A/B testing, refinamento de scripts e escala das operações que funcionam.",
    steps: [
      "Análise de Performance por Canal",
      "Otimização de Scripts e Abordagens",
      "A/B Testing de Campanhas",
      "Escala de Operações Validadas",
      "Implementação de IA Preditiva",
    ],
    status: "locked" as const,
    progress: 0,
    color: "oklch(0.80 0.16 85)",
  },
  {
    id: "autoridade",
    number: "05",
    title: "Autoridade",
    subtitle: "Liderança de Mercado",
    icon: Crown,
    description: "Posicionamento como referência. Conteúdo estratégico, cases de sucesso e autoridade no segmento.",
    steps: [
      "Estratégia de Conteúdo B2B",
      "Construção de Cases de Sucesso",
      "Programa de Indicação Estruturado",
      "Posicionamento de Autoridade",
      "Modelo de Receita Previsível",
    ],
    status: "locked" as const,
    progress: 0,
    color: "oklch(0.65 0.22 25)",
  },
];

function getStatusBadge(status: "locked" | "in_progress" | "completed") {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-brand-success/15 text-brand-success border-0 text-[10px]">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-primary/15 text-primary border-0 text-[10px]">
          <PlayCircle className="w-3 h-3 mr-1" /> Em Progresso
        </Badge>
      );
    case "locked":
      return (
        <Badge variant="outline" className="text-muted-foreground border-border/40 text-[10px]">
          <Lock className="w-3 h-3 mr-1" /> Bloqueado
        </Badge>
      );
  }
}

export default function Trail() {
  const overallProgress = Math.round(
    pillars.reduce((acc, p) => acc + p.progress, 0) / pillars.length
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Trilha de Transformação
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Método Vértice: 5 pilares para transformar sua operação comercial.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Progresso Geral</p>
              <p className="text-lg font-bold text-primary">{overallProgress}%</p>
            </div>
            <div className="w-24">
              <Progress value={overallProgress} className="h-2 [&>div]:bg-primary" />
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="space-y-4">
          {pillars.map((pillar, i) => {
            const isLocked = pillar.status === "locked";
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card
                  className={`border-border/30 bg-card/80 overflow-hidden transition-all ${
                    isLocked ? "opacity-60" : "hover:border-primary/30"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left indicator */}
                      <div
                        className="w-full md:w-1.5 h-1.5 md:h-auto shrink-0"
                        style={{ backgroundColor: isLocked ? "oklch(0.30 0.018 255 / 40%)" : pillar.color }}
                      />

                      <div className="flex-1 p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          {/* Icon + Number */}
                          <div className="flex items-center gap-4 md:gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: isLocked
                                  ? "oklch(0.24 0.020 255)"
                                  : `color-mix(in oklch, ${pillar.color} 15%, transparent)`,
                              }}
                            >
                              <pillar.icon
                                className="w-6 h-6"
                                style={{
                                  color: isLocked ? "oklch(0.45 0.015 255)" : pillar.color,
                                }}
                              />
                            </div>
                            <div className="md:hidden">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: isLocked ? "oklch(0.45 0.015 255)" : pillar.color }}
                                >
                                  {pillar.number}
                                </span>
                                <h3 className="font-bold text-base">{pillar.title}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground">{pillar.subtitle}</p>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="hidden md:flex items-center gap-2 mb-1">
                              <span
                                className="text-xs font-bold"
                                style={{ color: isLocked ? "oklch(0.45 0.015 255)" : pillar.color }}
                              >
                                {pillar.number}
                              </span>
                              <h3 className="font-bold text-base">{pillar.title}</h3>
                              <span className="text-xs text-muted-foreground">
                                — {pillar.subtitle}
                              </span>
                              <div className="ml-auto">{getStatusBadge(pillar.status)}</div>
                            </div>
                            <div className="md:hidden mb-2">{getStatusBadge(pillar.status)}</div>

                            <p className="text-sm text-muted-foreground mb-4">
                              {pillar.description}
                            </p>

                            {/* Steps */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                              {pillar.steps.map((step, si) => {
                                const stepDone = pillar.status === "completed" || (pillar.status === "in_progress" && si < Math.ceil(pillar.steps.length * pillar.progress / 100));
                                return (
                                  <div
                                    key={si}
                                    className={`flex items-center gap-2 text-xs p-2 rounded-md ${
                                      stepDone
                                        ? "bg-brand-success/10 text-brand-success"
                                        : isLocked
                                          ? "bg-muted/30 text-muted-foreground/50"
                                          : "bg-muted/50 text-muted-foreground"
                                    }`}
                                  >
                                    {stepDone ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                    ) : isLocked ? (
                                      <Lock className="w-3.5 h-3.5 shrink-0" />
                                    ) : (
                                      <div className="w-3.5 h-3.5 rounded-full border border-current shrink-0" />
                                    )}
                                    <span className="truncate">{step}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Progress bar */}
                            {!isLocked && (
                              <div className="flex items-center gap-3">
                                <Progress
                                  value={pillar.progress}
                                  className="h-1.5 flex-1 [&>div]:bg-primary"
                                />
                                <span className="text-xs font-medium text-primary">
                                  {pillar.progress}%
                                </span>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10">
                                  Continuar <ChevronRight className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
