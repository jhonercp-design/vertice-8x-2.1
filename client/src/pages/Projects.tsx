import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FolderKanban, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; gradient: string }> = {
  planning: { label: "Planejamento", gradient: "from-blue-500 to-blue-600" },
  execution: { label: "Execução", gradient: "from-yellow-500 to-yellow-600" },
  review: { label: "Revisão", gradient: "from-purple-500 to-purple-600" },
  completed: { label: "Concluído", gradient: "from-green-500 to-green-600" },
};

export default function Projects() {
  const { data: projects = [], isLoading } = trpc.projects.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.projects.create.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); toast.success("Projeto criado"); setOpen(false); setName(""); setClient(""); setBudget(""); } });
  const update = trpc.projects.update.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); } });
  const del = trpc.projects.delete.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); toast.success("Projeto removido"); } });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");

  const handleCreate = () => {
    if (!name || !client) return toast.error("Preencha nome e cliente");
    create.mutate({ name, client, budget, category });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Projetos</h1>
              <p className="text-muted-foreground mt-2">Gestão de projetos e entregas da operação.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Novo Projeto
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Projeto</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Implementação CRM" className="mt-1 bg-input border-border/50" /></div>
                  <div><Label>Cliente</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" className="mt-1 bg-input border-border/50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Orçamento (R$)</Label><Input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="0" className="mt-1 bg-input border-border/50" /></div>
                    <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Consultoria" className="mt-1 bg-input border-border/50" /></div>
                  </div>
                  <Button onClick={handleCreate} disabled={create.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {create.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Projects List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center">
                <FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum projeto criado ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {projects.map((project: any, idx: number) => {
                  const config = statusConfig[project.status || "planning"];
                  return (
                    <motion.div key={project.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 hover:bg-card/50 transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} opacity-10`}>
                            <FolderKanban className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{project.name}</h3>
                            <p className="text-xs text-muted-foreground">{project.client}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {project.budget && <p className="text-sm font-semibold">R$ {Number(project.budget).toLocaleString("pt-BR")}</p>}
                          <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-[10px]`}>{config.label}</Badge>
                          <button onClick={() => del.mutate({ id: project.id })} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
