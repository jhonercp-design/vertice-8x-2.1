import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, Play, Pause, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Playbooks() {
  const { data: playbooks = [], isLoading } = trpc.playbooks.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.playbooks.create.useMutation({ onSuccess: () => { utils.playbooks.list.invalidate(); toast.success("Playbook criado"); setOpen(false); setName(""); setFramework(""); } });
  const update = trpc.playbooks.update.useMutation({ onSuccess: () => { utils.playbooks.list.invalidate(); } });
  const del = trpc.playbooks.delete.useMutation({ onSuccess: () => { utils.playbooks.list.invalidate(); toast.success("Playbook removido"); } });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [framework, setFramework] = useState("");
  const [steps, setSteps] = useState("5");

  const handleCreate = () => {
    if (!name) return toast.error("Nome obrigatório");
    create.mutate({ name, framework, steps: parseInt(steps) || 5 });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Playbooks</h1>
              <p className="text-muted-foreground mt-2">Roteiros e frameworks de vendas da sua operação.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Novo Playbook
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Playbook</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: SPIN Selling" className="mt-1 bg-input border-border/50" /></div>
                  <div><Label>Framework</Label><Input value={framework} onChange={(e) => setFramework(e.target.value)} placeholder="Ex: SPIN, BANT, Challenger" className="mt-1 bg-input border-border/50" /></div>
                  <div><Label>Etapas</Label><Input value={steps} onChange={(e) => setSteps(e.target.value)} type="number" className="mt-1 bg-input border-border/50" /></div>
                  <Button onClick={handleCreate} disabled={create.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {create.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Playbooks Grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : playbooks.length === 0 ? (
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum playbook criado ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {playbooks.map((pb: any, idx: number) => (
                <motion.div key={pb.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                  <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-sm mb-2">{pb.name}</h3>
                        {pb.framework && <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 text-[10px]">{pb.framework}</Badge>}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => update.mutate({ id: pb.id, isActive: !pb.isActive })} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                          {pb.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => del.mutate({ id: pb.id })} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{pb.steps} etapas</p>
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">{pb.isActive ? "✓ Ativo" : "○ Inativo"}</p>
                    </div>
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
