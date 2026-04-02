import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Microscope, Calculator, TrendingUp, Target, ChevronRight, CheckCircle2, Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const questions = [
  { id: "revenue", label: "Receita mensal atual (R$)", type: "number", placeholder: "Ex: 50000" },
  { id: "team_size", label: "Tamanho da equipe comercial", type: "number", placeholder: "Ex: 5" },
  { id: "leads_month", label: "Leads gerados por mês", type: "number", placeholder: "Ex: 100" },
  { id: "conversion_rate", label: "Taxa de conversão atual (%)", type: "number", placeholder: "Ex: 5" },
  { id: "avg_ticket", label: "Ticket médio (R$)", type: "number", placeholder: "Ex: 5000" },
  { id: "sales_cycle", label: "Ciclo médio de vendas (dias)", type: "number", placeholder: "Ex: 30" },
];

export default function Onboarding() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [, setLocation] = useLocation();

  const { data: pastDiagnostics = [] } = trpc.diagnostics.list.useQuery();
  const saveMutation = trpc.diagnostics.save.useMutation({
    onSuccess: () => { toast.success("Diagnóstico salvo!"); },
    onError: (err) => toast.error(err.message),
  });

  const revenue = parseFloat(answers.revenue || "50000");
  const convRate = parseFloat(answers.conversion_rate || "5");
  const leadsCount = parseFloat(answers.leads_month || "100");
  const ticket = parseFloat(answers.avg_ticket || "5000");

  const maturityScore = Math.min(100, Math.round(convRate * 4 + (leadsCount > 50 ? 20 : 10) + (revenue > 30000 ? 20 : 10)));
  const potentialRevenue = leadsCount * (convRate * 2 / 100) * ticket;
  const revenueGap = Math.max(0, potentialRevenue - revenue);
  const projectedRoi = revenue > 0 ? Math.round((revenueGap / (revenue * 0.05)) * 100) : 0;

  const handleCalculate = () => {
    setShowResults(true);
    saveMutation.mutate({
      type: "onboarding",
      answers,
      maturityScore,
      revenueGap: String(revenueGap),
      projectedRoi: String(projectedRoi),
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Microscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Onboarding Estratégico</h1>
            <p className="text-xs text-muted-foreground">Diagnóstico de maturidade, GAP de receita e projeção de ROI</p>
          </div>
        </div>

        {!showResults ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Diagnóstico Comercial</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{Object.keys(answers).length}/{questions.length} respondidas</Badge>
                </div>
                <Progress value={(Object.keys(answers).length / questions.length) * 100} className="h-1.5 [&>div]:bg-primary mt-2" />
              </CardHeader>
              <CardContent className="space-y-5">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">{q.label}</Label>
                    <Input type={q.type} placeholder={q.placeholder} value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} className="h-9 bg-background/50 border-border/30" />
                  </div>
                ))}
                <Button className="w-full bg-primary text-primary-foreground" onClick={handleCalculate} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
                  Calcular Diagnóstico
                </Button>
              </CardContent>
            </Card>

            {pastDiagnostics.length > 0 && (
              <Card className="border-border/30 bg-card/80 mt-4">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Diagnósticos Anteriores</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {pastDiagnostics.slice(0, 5).map((d: any) => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded-lg border border-border/20">
                      <div>
                        <p className="text-xs font-medium">Score: {d.maturityScore}/100</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-danger">GAP: R$ {(Number(d.revenueGap) / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-brand-success">ROI: {d.projectedRoi}%</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border/30 bg-card/80 metric-card">
                <CardContent className="p-5 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary">{maturityScore}</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">Maturity Score</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{maturityScore < 40 ? "Iniciante" : maturityScore < 70 ? "Em Desenvolvimento" : "Avançado"}</p>
                </CardContent>
              </Card>
              <Card className="border-border/30 bg-card/80 metric-card">
                <CardContent className="p-5 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-danger/30 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-brand-danger" />
                  </div>
                  <p className="text-lg font-bold text-brand-danger">R$ {(revenueGap / 1000).toFixed(0)}K</p>
                  <p className="text-xs font-semibold text-foreground">GAP de Receita</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Potencial não capturado/mês</p>
                </CardContent>
              </Card>
              <Card className="border-border/30 bg-card/80 metric-card">
                <CardContent className="p-5 text-center">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-success/30 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-8 h-8 text-brand-success" />
                  </div>
                  <p className="text-lg font-bold text-brand-success">{projectedRoi}%</p>
                  <p className="text-xs font-semibold text-foreground">ROI Projetado</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Retorno sobre investimento</p>
                </CardContent>
              </Card>
            </div>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Diagnóstico Concluído</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Com base nos dados informados, identificamos um potencial de crescimento de{" "}
                      <span className="text-primary font-semibold">R$ {(revenueGap / 1000).toFixed(0)}K/mês</span>{" "}
                      com a implementação do Método Vértice. Sua operação está no nível{" "}
                      <span className="font-semibold">{maturityScore < 40 ? "Iniciante" : maturityScore < 70 ? "Em Desenvolvimento" : "Avançado"}</span>{" "}
                      e o ROI projetado é de <span className="text-brand-success font-semibold">{projectedRoi}%</span>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setShowResults(false); setAnswers({}); }} className="border-border/30">Refazer Diagnóstico</Button>
              <Button className="bg-primary text-primary-foreground flex-1" onClick={() => setLocation("/trail")}>
                Iniciar Trilha de Transformação <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
