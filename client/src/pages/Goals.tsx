import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Goals() {
  const { data: goals = [], isLoading } = trpc.goals.list.useQuery();
  const utils = trpc.useUtils();
  const createGoal = trpc.goals.create.useMutation({ onSuccess: () => { utils.goals.list.invalidate(); toast.success("Meta criada"); setOpen(false); setLabel(""); setTarget(""); setPeriod("monthly"); } });
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
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Metas</h1>
              <p className="text-muted-foreground mt-2">Defina e acompanhe as metas da sua operação comercial.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Nova Meta
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Nova Meta</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Nome da Meta</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Receita Mensal" className="mt-1 bg-input border-border/50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Valor Alvo</Label><Input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100000" type="number" className="mt-1 bg-input border-border/50" /></div>
                    <div><Label>Unidade</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger className="mt-1 bg-input border-border/50"><SelectValue /></SelectTrigger>
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
                      <SelectTrigger className="mt-1 bg-input border-border/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} disabled={createGoal.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {createGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Goals Grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : goals.length === 0 ? (
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma meta criada ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal: any, idx: number) => (
                <motion.div key={goal.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                  <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target className="w-4 h-4 text-primary" />
                      </div>
                      <button onClick={() => deleteGoal.mutate({ id: goal.id })} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{goal.label}</h3>
                    <p className="text-2xl font-bold mb-3">{goal.target} {goal.unit}</p>
                    <Progress value={Math.min(100, (goal.current / parseFloat(goal.target)) * 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">{goal.period === "monthly" ? "Mensal" : goal.period === "weekly" ? "Semanal" : "Trimestral"}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
