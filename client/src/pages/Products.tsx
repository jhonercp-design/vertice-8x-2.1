import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Products() {
  const { data: products = [], isLoading } = trpc.products.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.products.create.useMutation({ onSuccess: () => { utils.products.list.invalidate(); toast.success("Produto criado"); setOpen(false); } });
  const del = trpc.products.delete.useMutation({ onSuccess: () => { utils.products.list.invalidate(); toast.success("Produto removido"); } });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const statusColors: Record<string, string> = { active: "bg-green-500/20 text-green-400", inactive: "bg-muted text-muted-foreground", draft: "bg-yellow-500/20 text-yellow-400" };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold tracking-tight">Produtos & Serviços</h1><p className="text-muted-foreground">Catálogo de produtos e serviços da sua empresa</p></div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Produto</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Produto</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Consultoria Vértice 8x" /></div>
                <div><Label>Descrição</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição breve" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Preço (R$)</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="0" /></div>
                  <div><Label>Categoria</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Consultoria" /></div>
                </div>
                <Button onClick={() => { if (!name) return toast.error("Nome obrigatório"); create.mutate({ name, price, category, description }); }} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-32" /></Card>)}</div>
        : products.length === 0 ? <Card className="border-dashed"><CardContent className="flex flex-col items-center justify-center py-12"><Package className="h-12 w-12 text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">Nenhum produto cadastrado</p></CardContent></Card>
        : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p: any) => (
              <Card key={p.id} className="group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{p.name}</h3>
                      {p.description && <p className="text-sm text-muted-foreground mt-1">{p.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive" onClick={() => del.mutate({ id: p.id })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">R$ {Number(p.price || 0).toLocaleString("pt-BR")}</span>
                    <div className="flex items-center gap-2">
                      {p.category && <Badge variant="outline">{p.category}</Badge>}
                      <Badge className={statusColors[p.status] || statusColors.draft}>{p.status === "active" ? "Ativo" : p.status === "inactive" ? "Inativo" : "Rascunho"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      </div>
    </DashboardLayout>
  );
}
