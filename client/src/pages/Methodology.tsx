import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { RefreshCw, Target, Users, BarChart3, Zap, ShieldCheck, Lightbulb, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Target, title: "Pilar 1 - Estratégia Comercial", gradient: "from-blue-500 to-blue-600",
    description: "Definição de ICP, posicionamento, proposta de valor e metas claras.",
    steps: ["Definir ICP e personas", "Mapear proposta de valor", "Estabelecer metas SMART", "Criar cadência de prospecção"],
  },
  {
    icon: Users, title: "Pilar 2 - Gestão de Pessoas", gradient: "from-green-500 to-green-600",
    description: "Estruturação do time comercial, papéis, competências e desenvolvimento.",
    steps: ["Definir estrutura do time", "Mapear competências necessárias", "Criar plano de desenvolvimento", "Implementar rituais de gestão"],
  },
  {
    icon: RefreshCw, title: "Pilar 3 - Processos", gradient: "from-purple-500 to-purple-600",
    description: "Padronização do funil, playbooks, cadências e fluxos operacionais.",
    steps: ["Mapear funil de vendas", "Criar playbooks por etapa", "Definir cadências de contato", "Automatizar processos repetitivos"],
  },
  {
    icon: Zap, title: "Pilar 4 - Tecnologia", gradient: "from-orange-500 to-orange-600",
    description: "Stack tecnológico, CRM, automações e integrações.",
    steps: ["Implementar CRM", "Configurar automações", "Integrar canais de comunicação", "Ativar IA e analytics"],
  },
  {
    icon: BarChart3, title: "Pilar 5 - Indicadores", gradient: "from-cyan-500 to-cyan-600",
    description: "KPIs, dashboards, governança e tomada de decisão baseada em dados.",
    steps: ["Definir KPIs por camada", "Montar dashboard executivo", "Ativar AGC (Governança)", "Implementar rotina de análise"],
  },
];

export default function Methodology() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Metodologia Vértice 8X</h1>
            <p className="text-muted-foreground mt-2">Os 5 pilares fundamentais para transformar sua operação comercial.</p>
          </div>
        </motion.div>

        {/* Pillars */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                  {/* Header */}
                  <div className={`p-6 border-b border-border/30 bg-gradient-to-r ${pillar.gradient} opacity-5`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${pillar.gradient} opacity-10`}>
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{pillar.title}</h3>
                        <p className="text-sm text-muted-foreground">{pillar.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="p-6">
                    <p className="text-xs font-semibold text-muted-foreground mb-4 uppercase">Etapas de Implementação</p>
                    <div className="space-y-3">
                      {pillar.steps.map((step, stepIdx) => (
                        <motion.div key={stepIdx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (idx * 0.1) + (stepIdx * 0.05) }}>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                              {stepIdx + 1}
                            </div>
                            <p className="text-sm font-medium pt-0.5">{step}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Implementation Flow */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.5 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-8">
            <h2 className="text-lg font-bold mb-6">Fluxo de Implementação</h2>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {["Diagnóstico", "Planejamento", "Implementação", "Monitoramento", "Otimização"].map((phase, idx) => (
                <div key={idx} className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{phase}</p>
                  </div>
                  {idx < 4 && <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
