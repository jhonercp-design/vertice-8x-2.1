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
  Microscope, Calculator, TrendingUp, Target, ChevronRight, CheckCircle2, Loader2, Zap,
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
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Onboarding Estratégico</h1>
            <p className="text-muted-foreground mt-2">Diagnóstico de maturidade, GAP de receita e projeção de ROI.</p>
          </div>
        </motion.div>

        {!showResults ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
            <div className="max-w-2xl rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Diagnóstico Comercial</h2>
                  <Badge className="bg-primary/10 text-primary border-primary/20 border">{Object.keys(answers).length}/{questions.length}</Badge>
                </div>
                <Progress value={(Object.keys(answers).length / questions.length) * 100} className="h-2" />
              </div>

              <div className="p-6 space-y-4">
                {questions.map((q, idx) => (
                  <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                    <div>
                      <Label className="text-sm font-medium">{q.label}</Label>
                      <Input
                        type={q.type}
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        placeholder={q.placeholder}
                        className="mt-1 bg-input border-border/50"
                      />
                    </div>
                  </motion.div>
                ))}

                <Button
                  onClick={handleCalculate}
                  disabled={saveMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-orange-500 hover:scale-105 mt-6"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Calculator className="w-4 h-4 mr-1" />}
                  Calcular Diagnóstico
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="space-y-6">
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Maturity Score", value: `${maturityScore}%`, icon: Target, color: "from-blue-500 to-blue-600" },
                { label: "GAP de Receita", value: `R$ ${(revenueGap / 1000).toFixed(1)}K`, icon: TrendingUp, color: "from-green-500 to-green-600" },
                { label: "ROI Projetado", value: `${projectedRoi}%`, icon: Zap, color: "from-purple-500 to-purple-600" },
              ].map((metric, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
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
            </div>

            {/* Recommendations */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <h3 className="text-lg font-bold mb-4">Recomendações Estratégicas</h3>
                <div className="space-y-3">
                  {maturityScore < 40 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Comece com o diagnóstico profundo (Anatomia) para mapear gaps operacionais.</p>
                    </div>
                  )}
                  {revenueGap > 50000 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Potencial significativo de crescimento. Foco em qualificação de leads e otimização de pipeline.</p>
                    </div>
                  )}
                  {convRate < 3 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                      <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">Taxa de conversão baixa. Implemente playbooks e scripts estruturados.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <Button onClick={() => setShowResults(false)} className="bg-card/50 border border-border/30 hover:bg-card">
              ← Voltar
            </Button>
          </motion.div>
        )}

        {/* Past Diagnostics */}
        {pastDiagnostics.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.4 }}>
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
              <h3 className="text-lg font-bold mb-4">Diagnósticos Anteriores</h3>
              <div className="space-y-2">
                {pastDiagnostics.map((diag: any, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30 hover:border-primary/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{new Date(diag.createdAt).toLocaleDateString("pt-BR")}</p>
                      <p className="text-xs text-muted-foreground">Score: {diag.maturityScore}% | GAP: R$ {(Number(diag.revenueGap) / 1000).toFixed(1)}K</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
