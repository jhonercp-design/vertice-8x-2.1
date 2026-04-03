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
import { FileText, Plus, Trash2, Send, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; gradient: string; icon: any }> = {
  draft: { label: "Rascunho", color: "text-muted-foreground", gradient: "from-gray-500 to-gray-600", icon: FileText },
  sent: { label: "Enviada", color: "text-blue-500", gradient: "from-blue-500 to-blue-600", icon: Send },
  viewed: { label: "Visualizada", color: "text-purple-500", gradient: "from-purple-500 to-purple-600", icon: Eye },
  negotiation: { label: "Negociação", color: "text-yellow-500", gradient: "from-yellow-500 to-yellow-600", icon: Eye },
  signed: { label: "Assinada", color: "text-green-500", gradient: "from-green-500 to-green-600", icon: CheckCircle },
  rejected: { label: "Rejeitada", color: "text-red-500", gradient: "from-red-500 to-red-600", icon: XCircle },
};

export default function Proposals() {
  const { data: proposals = [], isLoading } = trpc.proposals.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.proposals.create.useMutation({ onSuccess: () => { utils.proposals.list.invalidate(); toast.success("Proposta criada"); setOpen(false); setTitle(""); setValue(""); } });
  const updateProposal = trpc.proposals.update.useMutation({ onSuccess: () => { utils.proposals.list.invalidate(); toast.success("Proposta atualizada"); } });
  const del = trpc.proposals.delete.useMutation({ onSuccess: () => { utils.proposals.list.invalidate(); toast.success("Proposta removida"); } });
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");


  const handleCreate = () => {
    if (!title || !value) return toast.error("Preencha título e valor");
    create.mutate({ title, value });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Propostas Comerciais</h1>
              <p className="text-muted-foreground mt-2">Gerencie e acompanhe suas propostas.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Nova Proposta
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Proposta</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Proposta de Consultoria" className="mt-1 bg-input border-border/50" /></div>
                  <div><Label>Valor</Label><Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" type="number" className="mt-1 bg-input border-border/50" /></div>

                  <Button onClick={handleCreate} disabled={create.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                    {create.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Criar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Proposals List */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : proposals.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma proposta criada ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {proposals.map((proposal: any, idx: number) => {
                  const config = statusConfig[proposal.status];
                  return (
                    <motion.div key={proposal.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-4 hover:bg-card/50 transition-colors group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} opacity-10`}>
                            <config.icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{proposal.title}</h3>
                            <p className="text-xs text-muted-foreground">R$ {Number(proposal.value).toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-[10px]`}>{config.label}</Badge>
                          <button onClick={() => del.mutate({ id: proposal.id })} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors opacity-0 group-hover:opacity-100">
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
