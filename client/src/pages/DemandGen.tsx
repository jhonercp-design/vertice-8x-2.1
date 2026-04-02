import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Zap, Globe, Mail, Phone, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const channels = [
  { icon: Globe, name: "Inbound Marketing", description: "SEO, conteúdo, blog, redes sociais", status: "active", leads: 0 },
  { icon: Mail, name: "Email Marketing", description: "Campanhas de nutrição e prospecção", status: "setup", leads: 0 },
  { icon: Phone, name: "Outbound", description: "Cold calling, social selling, prospecção ativa", status: "active", leads: 0 },
  { icon: Users, name: "Indicações", description: "Programa de referral e parcerias", status: "planned", leads: 0 },
  { icon: Zap, name: "Eventos", description: "Webinars, workshops, palestras", status: "planned", leads: 0 },
];

export default function DemandGen() {
  const { data: leads = [] } = trpc.leads.list.useQuery({});
  const sourceCount = leads.reduce((acc: Record<string, number>, l: any) => { acc[l.source || "direto"] = (acc[l.source || "direto"] || 0) + 1; return acc; }, {});

  const statusColors: Record<string, string> = { active: "bg-green-500/20 text-green-400", setup: "bg-yellow-500/20 text-yellow-400", planned: "bg-blue-500/20 text-blue-400" };
  const statusLabels: Record<string, string> = { active: "Ativo", setup: "Configurando", planned: "Planejado" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Geração de Demanda</h1><p className="text-muted-foreground">Canais de aquisição e estratégias de geração de leads</p></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Leads Este Mês</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{leads.length}</div><p className="text-xs text-muted-foreground mt-1">total no CRM</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Fontes Ativas</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{Object.keys(sourceCount).length}</div><p className="text-xs text-muted-foreground mt-1">canais gerando leads</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">CAC Estimado</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">-</div><p className="text-xs text-muted-foreground mt-1">configure investimentos para calcular</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" />Canais de Aquisição</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channels.map((ch) => (
                <div key={ch.name} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-primary/10"><ch.icon className="h-5 w-5 text-primary" /></div>
                    <div><p className="font-medium text-sm">{ch.name}</p><p className="text-xs text-muted-foreground">{ch.description}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[ch.status]}>{statusLabels[ch.status]}</Badge>
                    <Button variant="outline" size="sm" onClick={() => toast.info("Configuração do canal em breve")}>Configurar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {Object.keys(sourceCount).length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Distribuição por Fonte</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(sourceCount).sort(([,a], [,b]) => (b as number) - (a as number)).map(([source, count]) => (
                  <div key={source} className="p-4 rounded-xl bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{count as number}</p>
                    <p className="text-sm text-muted-foreground capitalize">{source}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
