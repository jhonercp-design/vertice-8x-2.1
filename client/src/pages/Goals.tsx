import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Goals() {
  const { data: goals = [], isLoading } = trpc.goals.list.useQuery();
  const utils = trpc.useUtils();
  const createGoal = trpc.goals.create.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Meta criada"); setOpen(false); } });
  const updateGoal = trpc.goals.update.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Meta atualizada"); } });
  const deleteGoal = trpc.goals.delete.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Meta removida"); } });

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("R$");
  const [period, setPeriod] = useState("monthly");

  const handleCreate = () => {
    if (!label || !target) return toast.error("Preencha nome e valor da meta");
    createGoal.mutate({ label, target, unit, period });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Metas</h1>
            <p className="text-muted-foreground">Defina e acompanhe as metas da sua operação comercial</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nova Meta</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Nova Meta</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Nome da Meta</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Receita Mensal" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Valor Alvo</Label><Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100000" type="number" /></div>
                  <div><Label>Unidade</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R$">R$</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="un">Unidades</SelectItem>
                        <SelectItem value="leads">Leads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Período</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createGoal.isPending}>{createGoal.isPending ? "Criando..." : "Criar Meta"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}
          </div>
        ) : goals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhuma meta definida ainda</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Crie sua primeira meta para começar a acompanhar</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal: any) => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((Number(goal.current || 0) / Number(goal.target)) * 100)) : 0;
              return (
                <Card key={goal.id} className="group">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{goal.label}</CardTitle>
                      <p className="text-xs text-muted-foreground capitalize">{goal.period === "monthly" ? "Mensal" : goal.period === "weekly" ? "Semanal" : goal.period === "quarterly" ? "Trimestral" : "Anual"}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => deleteGoal.mutate({ id: goal.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-2xl font-bold">{goal.unit === "R$" ? `R$ ${Number(goal.current || 0).toLocaleString("pt-BR")}` : `${Number(goal.current || 0)} ${goal.unit}`}</span>
                      <span className="text-sm text-muted-foreground mb-0.5">/ {goal.unit === "R$" ? `R$ ${Number(goal.target).toLocaleString("pt-BR")}` : `${Number(goal.target)} ${goal.unit}`}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                      <div className={`h-2.5 rounded-full transition-all ${pct >= 100 ? "bg-green-500" : pct >= 70 ? "bg-primary" : pct >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{pct}% concluído</span>
                      <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /><span>Ativo</span></div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Input placeholder="Atualizar valor" type="number" className="h-8 text-xs" onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value;
                          if (val) { updateGoal.mutate({ id: goal.id, current: val }); (e.target as HTMLInputElement).value = ""; }
                        }
                      }} />
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
