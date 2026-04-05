import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Stage {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_STAGES: Stage[] = [
  { id: "new", label: "Novo", color: "bg-gray-500" },
  { id: "contacted", label: "Contato", color: "bg-blue-500" },
  { id: "qualified", label: "Qualificado", color: "bg-purple-500" },
  { id: "proposal", label: "Proposta", color: "bg-orange-500" },
  { id: "negotiation", label: "Negociação", color: "bg-yellow-500" },
  { id: "won", label: "Ganho", color: "bg-green-500" },
];

export function PipelineManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [pipelines, setPipelines] = useState<any[]>([]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Nome do pipeline é obrigatório");
      return;
    }

    try {
      const newPipeline = { id: Date.now(), name, stages, isDefault: false };
      setPipelines([...pipelines, newPipeline]);
      toast.success("Pipeline criado com sucesso");
      setName("");
      setStages(DEFAULT_STAGES);
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao criar pipeline");
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !name.trim()) {
      toast.error("Nome do pipeline é obrigatório");
      return;
    }

    try {
      setPipelines(pipelines.map(p => p.id === editingId ? { ...p, name, stages } : p));
      toast.success("Pipeline atualizado com sucesso");
      setName("");
      setStages(DEFAULT_STAGES);
      setEditingId(null);
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao atualizar pipeline");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este pipeline?")) return;

    try {
      setPipelines(pipelines.filter(p => p.id !== id));
      toast.success("Pipeline deletado com sucesso");
    } catch (error) {
      toast.error("Erro ao deletar pipeline");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      setPipelines(pipelines.map(p => ({ ...p, isDefault: p.id === id })));
      toast.success("Pipeline definido como padrão");
    } catch (error) {
      toast.error("Erro ao definir pipeline padrão");
    }
  };

  const openEdit = (pipeline: any) => {
    setEditingId(pipeline.id);
    setName(pipeline.name);
    setStages(pipeline.stages || DEFAULT_STAGES);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Meus Pipelines</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setName(""); setStages(DEFAULT_STAGES); }} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Pipeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Pipeline" : "Criar Pipeline"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Pipeline</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Pipeline de Vendas" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Estágios</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stages.map((stage, idx) => (
                    <div key={stage.id} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${stage.color}`} />
                      <Input value={stage.label} onChange={(e) => { const newStages = [...stages]; newStages[idx].label = e.target.value; setStages(newStages); }} placeholder="Nome do estágio" />
                      <Button variant="ghost" size="sm" onClick={() => setStages(stages.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setStages([...stages, { id: `stage-${Date.now()}`, label: "Novo Estágio", color: "bg-gray-500" }])}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Estágio
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button onClick={editingId ? handleUpdate : handleCreate}>{editingId ? "Atualizar" : "Criar"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {pipelines.map((pipeline: any) => (
          <div key={pipeline.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <p className="font-medium">{pipeline.name}</p>
              <p className="text-sm text-gray-500">{pipeline.stages?.length || 0} estágios</p>
            </div>
            <div className="flex items-center gap-2">
              {pipeline.isDefault && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
              <Button variant="ghost" size="sm" onClick={() => openEdit(pipeline)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleSetDefault(pipeline.id)}>
                <Star className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(pipeline.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {pipelines.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum pipeline criado ainda</p>
            <p className="text-sm">Clique em "Novo Pipeline" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
