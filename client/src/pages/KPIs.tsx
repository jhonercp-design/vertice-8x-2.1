import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function KPIs() {
  const { data: kpis = [], isLoading } = trpc.kpis.list.useQuery();
  const utils = trpc.useUtils();
  const createKpi = trpc.kpis.create.useMutation({ onSuccess: () => { utils.kpis.list.invalidate(); toast.success("KPI criado"); setOpen(false); } });
  const deleteKpi = trpc.kpis.delete.useMutation({ onSuccess: () => { utils.kpis.list.invalidate(); toast.success("KPI removido"); } });
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("Vendas");
  const [unit, setUnit] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">KPIs</h1>
            <p className="text-muted-foreground">Indicadores-chave de performance da operação</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo KPI</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Novo KPI</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Nome</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Ticket Médio" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor</Label><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" type="number" /></div>
                  <div><Label>Unidade</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="R$, %, dias" /></div>
                </div>
                <div><Label>Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operação">Operação</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { if (!label) return toast.error("Nome obrigatório"); createKpi.mutate({ label, value, category, unit }); }} className="w-full" disabled={createKpi.isPending}>Criar KPI</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-24" /></Card>)}</div>
        ) : kpis.length === 0 ? (
          <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhum KPI cadastrado</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi: any) => {
              const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
              const trendColor = kpi.trend === "up" ? "text-green-500" : kpi.trend === "down" ? "text-red-500" : "text-muted-foreground";
              return (
                <Card key={kpi.id} className="group">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wider">{kpi.category}</p><CardTitle className="text-sm font-medium mt-1">{kpi.label}</CardTitle></div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => deleteKpi.mutate({ id: kpi.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold">{kpi.unit && kpi.unit !== "%" ? `${kpi.unit} ` : ""}{Number(kpi.value || 0).toLocaleString("pt-BR")}{kpi.unit === "%" ? "%" : ""}</span>
                      <div className={`flex items-center gap-1 text-xs ${trendColor} mb-1`}><TrendIcon className="h-3 w-3" /><span>{Number(kpi.change || 0) > 0 ? "+" : ""}{kpi.change || 0}%</span></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
