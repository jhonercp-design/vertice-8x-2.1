import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Lock, CheckCircle2, PlayCircle, Microscope, Building2,
  Rocket, Zap, Crown, ChevronRight, Loader2, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

const pillarsData = [
  {
    id: "anatomia", number: "01", title: "Anatomia", subtitle: "Diagnóstico Profundo", icon: Microscope, color: "from-orange-500 to-orange-600",
    description: "Mapeamento completo da operação comercial. ICP, personas, análise de mercado e identificação de gaps de receita.",
    steps: ["Diagnóstico de Maturidade Comercial", "Mapeamento de ICP e Personas", "Análise de Mercado e Concorrência", "Identificação de GAP de Receita", "Relatório de Anatomia Comercial"],
  },
  {
    id: "arquitetura", number: "02", title: "Arquitetura", subtitle: "Estrutura Comercial", icon: Building2, color: "from-blue-500 to-blue-600",
    description: "Construção da máquina comercial. Processos, playbooks, scripts e frameworks de vendas personalizados.",
    steps: ["Desenho do Processo Comercial", "Criação de Playbooks de Vendas", "Scripts de Prospecção e Qualificação", "Framework de Proposta de Valor", "Estrutura de Métricas e KPIs"],
  },
  {
    id: "ativacao", number: "03", title: "Ativação", subtitle: "Execução Estratégica", icon: Rocket, color: "from-green-500 to-green-600",
    description: "Ativação de campanhas, automações e fluxos de prospecção. Inbound e outbound em operação.",
    steps: ["Configuração de Automações", "Lançamento de Campanhas Outbound", "Setup de Fluxos Inbound", "Integração de Canais (WhatsApp, Email)", "Treinamento da Equipe Comercial"],
  },
  {
    id: "aceleracao", number: "04", title: "Aceleração", subtitle: "Escala e Otimização", icon: Zap, color: "from-yellow-500 to-yellow-600",
    description: "Otimização baseada em dados. A/B testing, refinamento de scripts e escala das operações que funcionam.",
    steps: ["Análise de Performance por Canal", "Otimização de Scripts e Abordagens", "A/B Testing de Campanhas", "Escala de Operações Validadas", "Implementação de IA Preditiva"],
  },
  {
    id: "autoridade", number: "05", title: "Autoridade", subtitle: "Liderança de Mercado", icon: Crown, color: "from-purple-500 to-purple-600",
    description: "Posicionamento como referência. Conteúdo estratégico, cases de sucesso e autoridade no segmento.",
    steps: ["Estratégia de Conteúdo B2B", "Construção de Cases de Sucesso", "Programa de Indicação Estruturado", "Posicionamento de Autoridade", "Modelo de Receita Previsível"],
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return <Badge className="bg-brand-success/15 text-brand-success border-0 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" /> Concluído</Badge>;
    case "in_progress":
      return <Badge className="bg-primary/15 text-primary border-0 text-[10px]"><PlayCircle className="w-3 h-3 mr-1" /> Em Progresso</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground border-border/40 text-[10px]"><Lock className="w-3 h-3 mr-1" /> Bloqueado</Badge>;
  }
}

export default function Trail() {
  const { data: progressData = [], isLoading } = trpc.trail.getProgress.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.trail.updateProgress.useMutation({
    onSuccess: () => { utils.trail.getProgress.invalidate(); toast.success("Progresso atualizado!"); },
  });

  // Build pillar states from DB
  const progressMap: Record<string, { stepIndex: number; status: string }> = {};
  progressData.forEach((p: any) => { progressMap[p.pillar] = { stepIndex: p.stepIndex, status: p.status }; });

  const pillars = pillarsData.map((p, idx) => {
    const dbProgress = progressMap[p.id];
    let status = "locked";
    let stepIndex = 0;

    if (dbProgress) {
      status = dbProgress.status;
      stepIndex = dbProgress.stepIndex;
    } else if (idx === 0) {
      status = "in_progress"; // First pillar always unlocked
    }

    const progress = status === "completed" ? 100 : Math.round((stepIndex / p.steps.length) * 100);
    // Unlock next pillar if previous is completed
    if (status === "locked" && idx > 0) {
      const prevProgress = progressMap[pillarsData[idx - 1].id];
      if (prevProgress?.status === "completed") status = "in_progress";
    }

    return { ...p, status, progress, stepIndex };
  });

  const overallProgress = Math.round(pillars.reduce((acc, p) => acc + p.progress, 0) / pillars.length);

  const handleAdvance = (pillarId: string, currentStep: number, totalSteps: number) => {
    const nextStep = currentStep + 1;
    const newStatus = nextStep >= totalSteps ? "completed" : "in_progress";
    updateMutation.mutate({ pillar: pillarId, stepIndex: nextStep, totalSteps, status: newStatus });
  };

  if (isLoading) {
    return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Trilha Vértice</h1>
              <p className="text-muted-foreground mt-2">Os 5 Pilares do Método Vértice 8x. Progresso desbloqueado sequencialmente.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-3xl font-bold">{overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Progresso Geral</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Progress */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Progresso da Jornada</h2>
              <span className="text-sm text-muted-foreground">{overallProgress}% completo</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </motion.div>

        {/* Pillars */}
        <div className="space-y-4">
          {pillars.map((pillar, idx) => (
            <motion.div key={pillar.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: idx * 0.1 }}>
              <div className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${pillar.status === "locked" ? "border-border/20 bg-card/30 opacity-60" : "border-border/30 bg-gradient-to-br from-card/80 to-card/40 hover:border-primary/50 hover:shadow-lg"}`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${pillar.color} opacity-10 flex-shrink-0`}>
                        <pillar.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-muted-foreground">{pillar.number}</span>
                          <h3 className="text-lg font-bold">{pillar.title}</h3>
                          {getStatusBadge(pillar.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{pillar.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-2">{pillar.description}</p>
                      </div>
                    </div>
                    {pillar.status !== "locked" && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-primary">{pillar.progress}%</p>
                        <p className="text-[10px] text-muted-foreground">Progresso</p>
                      </div>
                    )}
                  </div>

                  {pillar.status !== "locked" && (
                    <>
                      <Progress value={pillar.progress} className="h-1.5 mb-4" />
                      <div className="space-y-2 mb-4">
                        {pillar.steps.map((step, stepIdx) => (
                          <div key={stepIdx} className={`flex items-center gap-2 text-xs ${stepIdx <= pillar.stepIndex ? "text-foreground" : "text-muted-foreground"}`}>
                            {stepIdx < pillar.stepIndex ? (
                              <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0" />
                            ) : stepIdx === pillar.stepIndex ? (
                              <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0" />
                            )}
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                      {pillar.stepIndex < pillar.steps.length && (
                        <Button onClick={() => handleAdvance(pillar.id, pillar.stepIndex, pillar.steps.length)} disabled={updateMutation.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500 hover:scale-105">
                          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                          Avançar para Próxima Etapa
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
