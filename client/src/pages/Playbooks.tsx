import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Trash2, Play, Pause } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Playbooks() {
  const { data: playbooks = [], isLoading } = trpc.playbooks.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.playbooks.create.useMutation({ onSuccess: () => { utils.playbooks.list.invalidate(); toast.success("Playbook criado"); setOpen(false); } });
  const update = trpc.playbooks.update.useMutation({ onSuccess: () => { utils.playbooks.list.invalidate(); } });
  const del = trpc.playbooks.delete.useMutation({ onSuccess: () => { utils.playbooks.list.invalidate(); toast.success("Playbook removido"); } });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [framework, setFramework] = useState("");
  const [steps, setSteps] = useState("5");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Playbooks</h1><p className="text-muted-foreground">Roteiros e frameworks de vendas da sua operação</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Playbook</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Playbook</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: SPIN Selling" /></div>
                <div><Label>Framework</Label><Input value={framework} onChange={(e) => setFramework(e.target.value)} placeholder="Ex: SPIN, BANT, Challenger" /></div>
                <div><Label>Etapas</Label><Input value={steps} onChange={(e) => setSteps(e.target.value)} type="number" /></div>
                <Button onClick={() => { if (!name) return toast.error("Nome obrigatório"); create.mutate({ name, framework, steps: parseInt(steps) || 5 }); }} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}</div>
        : playbooks.length === 0 ? <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhum playbook criado</p></CardContent></Card>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map((pb: any) => (
              <Card key={pb.id} className="group">
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div><CardTitle className="text-sm font-medium">{pb.name}</CardTitle>{pb.framework && <Badge variant="outline" className="mt-1">{pb.framework}</Badge>}</div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => update.mutate({ id: pb.id, isActive: !pb.isActive })}>{pb.isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate({ id: pb.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{pb.steps || 0} etapas</span>
                    <Badge variant={pb.isActive ? "default" : "secondary"}>{pb.isActive ? "Ativo" : "Inativo"}</Badge>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">Taxa de uso: {pb.usageRate || 0}%</div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
