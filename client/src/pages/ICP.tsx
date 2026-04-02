import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Users } from "lucide-react";

export default function ICP() {
  const { data: leads = [] } = trpc.leads.list.useQuery({});
  const icpDistribution = leads.reduce((acc: Record<string, number>, lead: any) => {
    const fit = lead.icpFit || "Sem classificação";
    acc[fit] = (acc[fit] || 0) + 1;
    return acc;
  }, {});

  const fitColors: Record<string, string> = { A: "bg-green-500/20 text-green-400 border-green-500/30", B: "bg-blue-500/20 text-blue-400 border-blue-500/30", C: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", D: "bg-red-500/20 text-red-400 border-red-500/30" };
  const fitLabels: Record<string, string> = { A: "Perfil Ideal", B: "Bom Fit", C: "Fit Médio", D: "Baixo Fit" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ICP Builder</h1>
          <p className="text-muted-foreground">Perfil de Cliente Ideal - Classificação e análise de fit dos seus leads</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["A", "B", "C", "D"].map((fit) => (
            <Card key={fit}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Fit {fit}</CardTitle>
                  <Badge variant="outline" className={fitColors[fit]}>{fitLabels[fit]}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{icpDistribution[fit] || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">leads classificados</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crosshair className="h-5 w-5 text-primary" />Critérios do ICP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Demográfico</h3>
                <div className="space-y-2 text-sm">
                  <p>Segmento: B2B / SaaS / Serviços</p>
                  <p>Faturamento: R$ 1M - R$ 50M/ano</p>
                  <p>Funcionários: 10 - 500</p>
                  <p>Região: Brasil (Sul/Sudeste)</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Comportamental</h3>
                <div className="space-y-2 text-sm">
                  <p>Busca crescimento estruturado</p>
                  <p>Investe em tecnologia</p>
                  <p>Decisor acessível</p>
                  <p>Ciclo de venda: 15-60 dias</p>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Dor Principal</h3>
                <div className="space-y-2 text-sm">
                  <p>Falta de previsibilidade de receita</p>
                  <p>Processo comercial desorganizado</p>
                  <p>Dependência de poucos vendedores</p>
                  <p>Sem governança comercial</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Leads por Classificação ICP</CardTitle></CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Cadastre leads no CRM e classifique-os para ver a distribuição aqui</p>
            ) : (
              <div className="space-y-2">
                {leads.filter((l: any) => l.icpFit).map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company || "Sem empresa"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Score: {lead.icpScore || 0}</span>
                      <Badge variant="outline" className={fitColors[lead.icpFit] || ""}>{lead.icpFit}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
