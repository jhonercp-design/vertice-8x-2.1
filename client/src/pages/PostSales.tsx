import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Handshake, Star, AlertTriangle, TrendingUp, Users } from "lucide-react";

export default function PostSales() {
  const { data: leads = [] } = trpc.leads.list.useQuery({});
  const wonLeads = leads.filter((l: any) => l.status === "won");
  const { data: deals = [] } = trpc.deals.list.useQuery();
  const wonDeals = deals.filter((d: any) => d.stage === "won");

  const totalRecurring = wonDeals.reduce((acc: number, d: any) => acc + Number(d.value || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Pós-Venda</h1><p className="text-muted-foreground">Gestão de clientes ativos, retenção e expansão</p></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Clientes Ativos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{wonLeads.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" />Receita Recorrente</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {totalRecurring.toLocaleString("pt-BR")}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" />NPS</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">-</div><p className="text-xs text-muted-foreground">Configure pesquisa NPS</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" />Risco de Churn</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">0</div><p className="text-xs text-muted-foreground">clientes em risco</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" />Clientes Ganhos</CardTitle></CardHeader>
          <CardContent>
            {wonLeads.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Feche deals no CRM para ver seus clientes aqui</p>
            ) : (
              <div className="space-y-3">
                {wonLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company || "Sem empresa"} | {lead.email || "Sem email"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">R$ {Number(lead.value || 0).toLocaleString("pt-BR")}</span>
                      <Badge className="bg-green-500/20 text-green-400">Ativo</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Health Score</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">O Health Score será calculado automaticamente com base na atividade dos clientes, NPS e engajamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Oportunidades de Upsell</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">Identifique oportunidades de expansão nos clientes ativos</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
