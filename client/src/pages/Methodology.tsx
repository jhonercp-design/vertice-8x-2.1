import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Target, Users, BarChart3, Zap, ShieldCheck, Lightbulb, ArrowRight } from "lucide-react";

const pillars = [
  {
    icon: Target, title: "Pilar 1 - Estratégia Comercial", color: "text-blue-500", bg: "bg-blue-500/10",
    description: "Definição de ICP, posicionamento, proposta de valor e metas claras.",
    steps: ["Definir ICP e personas", "Mapear proposta de valor", "Estabelecer metas SMART", "Criar cadência de prospecção"],
  },
  {
    icon: Users, title: "Pilar 2 - Gestão de Pessoas", color: "text-green-500", bg: "bg-green-500/10",
    description: "Estruturação do time comercial, papéis, competências e desenvolvimento.",
    steps: ["Definir estrutura do time", "Mapear competências necessárias", "Criar plano de desenvolvimento", "Implementar rituais de gestão"],
  },
  {
    icon: RefreshCw, title: "Pilar 3 - Processos", color: "text-purple-500", bg: "bg-purple-500/10",
    description: "Padronização do funil, playbooks, cadências e fluxos operacionais.",
    steps: ["Mapear funil de vendas", "Criar playbooks por etapa", "Definir cadências de contato", "Automatizar processos repetitivos"],
  },
  {
    icon: Zap, title: "Pilar 4 - Tecnologia", color: "text-orange-500", bg: "bg-orange-500/10",
    description: "Stack tecnológico, CRM, automações e integrações.",
    steps: ["Implementar CRM", "Configurar automações", "Integrar canais de comunicação", "Ativar IA e analytics"],
  },
  {
    icon: BarChart3, title: "Pilar 5 - Indicadores", color: "text-cyan-500", bg: "bg-cyan-500/10",
    description: "KPIs, dashboards, governança e tomada de decisão baseada em dados.",
    steps: ["Definir KPIs por camada", "Montar dashboard executivo", "Ativar AGC (Governança)", "Implementar rotina de análise"],
  },
];

const frameworks = [
  { name: "SPIN Selling", description: "Situação, Problema, Implicação, Necessidade de solução" },
  { name: "BANT", description: "Budget, Authority, Need, Timeline" },
  { name: "Challenger Sale", description: "Ensinar, Personalizar, Controlar a conversa" },
  { name: "MEDDIC", description: "Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion" },
  { name: "Sandler", description: "Qualificação reversa, dor antes de solução" },
];

export default function Methodology() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Metodologia Vértice 8x</h1>
          <p className="text-muted-foreground">Os 5 Pilares da Máquina de Vendas e frameworks de referência</p>
        </div>

        <div className="space-y-4">
          {pillars.map((p, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${p.bg}`}><p.icon className={`h-5 w-5 ${p.color}`} /></div>
                  <div>
                    <CardTitle className="text-base">{p.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {p.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs py-1">
                        <span className="font-bold mr-1">{j + 1}.</span>{step}
                      </Badge>
                      {j < p.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" />Frameworks de Vendas</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frameworks.map((f) => (
                <div key={f.name} className="p-4 rounded-xl bg-muted/30">
                  <p className="font-semibold text-sm mb-1">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />Governança Comercial (AGC)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <p>O AGC (Agente de Governança Comercial) é o módulo de inteligência que monitora a saúde da operação em tempo real.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-muted/30"><p className="font-semibold mb-1">Monitoramento</p><p className="text-xs text-muted-foreground">Análise contínua de KPIs, pipeline e atividades</p></div>
                <div className="p-4 rounded-xl bg-muted/30"><p className="font-semibold mb-1">Alertas</p><p className="text-xs text-muted-foreground">Notificações proativas sobre riscos e oportunidades</p></div>
                <div className="p-4 rounded-xl bg-muted/30"><p className="font-semibold mb-1">Recomendações</p><p className="text-xs text-muted-foreground">Sugestões de ação baseadas em IA</p></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
