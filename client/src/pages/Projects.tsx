import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  planning: { label: "Planejamento", color: "bg-blue-500/20 text-blue-400" },
  execution: { label: "Execução", color: "bg-yellow-500/20 text-yellow-400" },
  review: { label: "Revisão", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "Concluído", color: "bg-green-500/20 text-green-400" },
};

export default function Projects() {
  const { data: projects = [], isLoading } = trpc.projects.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.projects.create.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); toast.success("Projeto criado"); setOpen(false); } });
  const update = trpc.projects.update.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); } });
  const del = trpc.projects.delete.useMutation({ onSuccess: () => { utils.projects.list.invalidate(); toast.success("Projeto removido"); } });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [budget, setBudget] = useState("");
  const [category, setCategory] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Projetos</h1><p className="text-muted-foreground">Gestão de projetos e entregas da operação</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Projeto</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Projeto</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Implantação CRM Cliente X" /></div>
                <div><Label>Cliente</Label><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nome do cliente" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Orçamento (R$)</Label><Input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" /></div>
                  <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Consultoria" /></div>
                </div>
                <Button onClick={() => { if (!name) return toast.error("Nome obrigatório"); create.mutate({ name, client, budget, category }); }} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-24" /></Card>)}</div>
        : projects.length === 0 ? <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhum projeto cadastrado</p></CardContent></Card>
        : <div className="space-y-3">
            {projects.map((p: any) => {
              const cfg = statusConfig[p.status] || statusConfig.planning;
              return (
                <Card key={p.id} className="group">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-sm">{p.name}</h3>
                        <Badge className={cfg.color}>{cfg.label}</Badge>
                        {p.category && <Badge variant="outline">{p.category}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{p.client || "Sem cliente"} {p.budget ? `| Orçamento: R$ ${Number(p.budget).toLocaleString("pt-BR")}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1"><span>{p.progress || 0}%</span></div>
                        <div className="w-full bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${p.progress || 0}%` }} /></div>
                      </div>
                      <Select value={p.status} onValueChange={(s) => update.mutate({ id: p.id, status: s as any })}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => del.mutate({ id: p.id })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
