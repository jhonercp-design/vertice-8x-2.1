import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, Send, Eye, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Enviada", color: "bg-blue-500/20 text-blue-400", icon: Send },
  viewed: { label: "Visualizada", color: "bg-purple-500/20 text-purple-400", icon: Eye },
  negotiation: { label: "Negociação", color: "bg-yellow-500/20 text-yellow-400", icon: Eye },
  signed: { label: "Assinada", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  rejected: { label: "Rejeitada", color: "bg-red-500/20 text-red-400", icon: XCircle },
};

export default function Proposals() {
  const { data: proposals = [], isLoading } = trpc.proposals.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.proposals.create.useMutation({ onSuccess: () => { utils.proposals.list.invalidate(); toast.success("Proposta criada"); setOpen(false); } });
  const updateProposal = trpc.proposals.update.useMutation({ onSuccess: () => { utils.proposals.list.invalidate(); toast.success("Proposta atualizada"); } });
  const del = trpc.proposals.delete.useMutation({ onSuccess: () => { utils.proposals.list.invalidate(); toast.success("Proposta removida"); } });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Propostas Comerciais</h1><p className="text-muted-foreground">Gerencie e acompanhe suas propostas</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nova Proposta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Proposta</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Proposta Consultoria Vértice" /></div>
                <div><Label>Valor (R$)</Label><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="50000" type="number" /></div>
                <Button onClick={() => { if (!title) return toast.error("Título obrigatório"); create.mutate({ title, value }); }} className="w-full">Criar Proposta</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-20" /></Card>)}</div>
        : proposals.length === 0 ? <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><FileText className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhuma proposta criada</p></CardContent></Card>
        : <div className="space-y-3">
            {proposals.map((p: any) => {
              const cfg = statusConfig[p.status] || statusConfig.draft;
              return (
                <Card key={p.id} className="group">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${cfg.color}`}><cfg.icon className="h-4 w-4" /></div>
                      <div>
                        <p className="font-medium text-sm">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("pt-BR") : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">R$ {Number(p.value || 0).toLocaleString("pt-BR")}</span>
                      <Select value={p.status} onValueChange={(s) => updateProposal.mutate({ id: p.id, status: s as any })}>
                        <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                        </SelectContent>
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
