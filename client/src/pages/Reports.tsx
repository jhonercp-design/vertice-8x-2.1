import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target, BarChart3, PieChart } from "lucide-react";

export default function Reports() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: pipeline = [] } = trpc.dashboard.pipeline.useQuery();
  const { data: leadsByStatus = [] } = trpc.dashboard.leadsByStatus.useQuery();
  const { data: leads = [] } = trpc.leads.list.useQuery({});

  const totalLeads = Number(kpis?.totalLeads || 0);
  const wonDeals = Number(kpis?.wonDeals || 0);
  const totalRevenue = Number(kpis?.totalRevenue || 0);
  const conversionRate = kpis?.conversionRate || 0;

  const sourceDistribution = leads.reduce((acc: Record<string, number>, lead: any) => {
    const src = lead.source || "Direto";
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Relatórios</h1><p className="text-muted-foreground">Visão analítica completa da operação comercial</p></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Total Leads</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalLeads}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" />Receita Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString("pt-BR")}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" />Deals Ganhos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{wonDeals}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-orange-500" />Conversão</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{conversionRate}%</div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Pipeline por Estágio</CardTitle></CardHeader>
            <CardContent>
              {pipeline.length === 0 ? <p className="text-muted-foreground text-center py-8">Sem dados de pipeline</p> : (
                <div className="space-y-3">
                  {pipeline.map((s: any) => {
                    const labels: Record<string, string> = { prospecting: "Prospecção", qualification: "Qualificação", proposal: "Proposta", negotiation: "Negociação", closing: "Fechamento", won: "Ganho", lost: "Perdido" };
                    const maxVal = Math.max(...pipeline.map((p: any) => Number(p.value || 0)), 1);
                    return (
                      <div key={s.stage}>
                        <div className="flex justify-between text-sm mb-1"><span>{labels[s.stage] || s.stage}</span><span className="font-medium">R$ {Number(s.value || 0).toLocaleString("pt-BR")} ({s.count})</span></div>
                        <div className="w-full bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary" style={{ width: `${(Number(s.value || 0) / maxVal) * 100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" />Leads por Status</CardTitle></CardHeader>
            <CardContent>
              {leadsByStatus.length === 0 ? <p className="text-muted-foreground text-center py-8">Sem dados de leads</p> : (
                <div className="space-y-3">
                  {leadsByStatus.map((s: any) => {
                    const labels: Record<string, string> = { new: "Novo", contacted: "Contatado", qualified: "Qualificado", proposal: "Proposta", negotiation: "Negociação", won: "Ganho", lost: "Perdido" };
                    const colors: Record<string, string> = { new: "bg-blue-500", contacted: "bg-cyan-500", qualified: "bg-green-500", proposal: "bg-yellow-500", negotiation: "bg-orange-500", won: "bg-emerald-500", lost: "bg-red-500" };
                    return (
                      <div key={s.status} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${colors[s.status] || "bg-muted"}`} /><span className="text-sm">{labels[s.status] || s.status}</span></div>
                        <span className="font-semibold text-sm">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Leads por Fonte</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(sourceDistribution).length === 0 ? <p className="text-muted-foreground text-center py-8">Cadastre leads com fonte para ver a distribuição</p> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(sourceDistribution).map(([source, count]) => (
                  <div key={source} className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{count as number}</p>
                    <p className="text-sm text-muted-foreground capitalize">{source}</p>
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
