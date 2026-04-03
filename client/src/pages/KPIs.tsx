import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart3, Plus, Trash2, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function KPIs() {
  const { data: kpis = [], isLoading } = trpc.kpis.list.useQuery();
  const utils = trpc.useUtils();
  const createKpi = trpc.kpis.create.useMutation({ onSuccess: () => { utils.kpis.list.invalidate(); toast.success("KPI criado"); setOpen(false); setLabel(""); setValue(""); } });
  const deleteKpi = trpc.kpis.delete.useMutation({ onSuccess: () => { utils.kpis.list.invalidate(); toast.success("KPI removido"); } });
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState("Vendas");
  const [unit, setUnit] = useState("");

  const categories = ["Vendas", "Marketing", "Operação", "Financeiro"];
  const categoryColors: Record<string, string> = {
    Vendas: "from-blue-500 to-blue-600",
    Marketing: "from-purple-500 to-purple-600",
    Operação: "from-green-500 to-green-600",
    Financeiro: "from-orange-500 to-orange-600",
  };

  const handleCreate = () => {
    if (!label || !value) return toast.error("Preencha nome e valor");
    createKpi.mutate({ label, value, category, unit });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">KPIs</h1>
              <p className="text-muted-foreground mt-2">Indicadores-chave de performance da operação.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Novo KPI
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Novo KPI</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Nome</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Ticket Médio" className="mt-1 bg-input border-border/50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Valor</Label><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" type="number" className="mt-1 bg-input border-border/50" /></div>
                    <div><Label>Unidade</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="R$, %, dias" className="mt-1 bg-input border-border/50" /></div>
                  </div>
                  <div><Label>Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="mt-1 bg-input border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} disabled={createKpi.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {createKpi.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* KPIs by Category */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : kpis.length === 0 ? (
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-12 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum KPI criado ainda</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat) => {
              const catKpis = kpis.filter((k: any) => k.category === cat);
              if (catKpis.length === 0) return null;
              return (
                <motion.div key={cat} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                  <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
                    <div className={`p-4 bg-gradient-to-r ${categoryColors[cat]} opacity-10 border-b border-border/30`}>
                      <h3 className="font-semibold">{cat}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {catKpis.map((kpi: any, idx: number) => (
                        <motion.div key={kpi.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                          <div className="group relative overflow-hidden rounded-lg border border-border/30 bg-card/50 p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm">{kpi.label}</h4>
                              <button onClick={() => deleteKpi.mutate({ id: kpi.id })} className="p-1 rounded hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-2xl font-bold text-primary">{kpi.value} {kpi.unit}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
