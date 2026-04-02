import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, DollarSign, Target } from "lucide-react";

export default function Forecast() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: pipeline = [] } = trpc.dashboard.pipeline.useQuery();

  const pipelineValue = Number(kpis?.pipelineValue || 0);
  const wonValue = Number(kpis?.totalRevenue || 0);
  const conversionRate = kpis?.conversionRate || 0;
  const weightedForecast = pipeline.reduce((acc: number, stage: any) => {
    const prob: Record<string, number> = { prospecting: 10, qualification: 25, proposal: 50, negotiation: 70, closing: 90, won: 100, lost: 0 };
    return acc + (Number(stage.value || 0) * (prob[stage.stage] || 0) / 100);
  }, 0);

  const scenarios = [
    { label: "Conservador", multiplier: 0.7, color: "text-yellow-500" },
    { label: "Realista", multiplier: 1.0, color: "text-primary" },
    { label: "Otimista", multiplier: 1.3, color: "text-green-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forecast de Vendas</h1>
          <p className="text-muted-foreground">Projeção de receita baseada no pipeline atual</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Pipeline Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {pipelineValue.toLocaleString("pt-BR")}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Receita Fechada</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {wonValue.toLocaleString("pt-BR")}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" />Taxa de Conversão</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{conversionRate}%</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calculator className="h-4 w-4 text-orange-500" />Forecast Ponderado</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {weightedForecast.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Cenários de Projeção</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenarios.map((s) => (
                <div key={s.label} className="p-6 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>R$ {(weightedForecast * s.multiplier).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-muted-foreground mt-2">{Math.round(s.multiplier * 100)}% do forecast ponderado</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pipeline por Estágio</CardTitle></CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Crie deals no CRM para ver o forecast por estágio</p>
            ) : (
              <div className="space-y-3">
                {pipeline.map((stage: any) => {
                  const prob: Record<string, number> = { prospecting: 10, qualification: 25, proposal: 50, negotiation: 70, closing: 90, won: 100, lost: 0 };
                  const stageLabels: Record<string, string> = { prospecting: "Prospecção", qualification: "Qualificação", proposal: "Proposta", negotiation: "Negociação", closing: "Fechamento", won: "Ganho", lost: "Perdido" };
                  const weighted = Number(stage.value || 0) * (prob[stage.stage] || 0) / 100;
                  return (
                    <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">{stageLabels[stage.stage] || stage.stage}</span>
                        <span className="text-xs text-muted-foreground">{stage.count} deals</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">R$ {Number(stage.value || 0).toLocaleString("pt-BR")}</span>
                        <span className="text-xs text-muted-foreground">x {prob[stage.stage] || 0}%</span>
                        <span className="font-semibold">R$ {weighted.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
