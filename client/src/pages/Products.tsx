import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Package, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Products() {
  const { data: products = [], isLoading } = trpc.products.list.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.products.create.useMutation({ onSuccess: () => { utils.products.list.invalidate(); toast.success("Produto criado"); setOpen(false); setName(""); setPrice(""); } });
  const del = trpc.products.delete.useMutation({ onSuccess: () => { utils.products.list.invalidate(); toast.success("Produto removido"); } });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const statusColors: Record<string, { color: string; gradient: string }> = {
    active: { color: "text-green-500", gradient: "from-green-500 to-green-600" },
    inactive: { color: "text-muted-foreground", gradient: "from-gray-500 to-gray-600" },
    draft: { color: "text-yellow-500", gradient: "from-yellow-500 to-yellow-600" },
  };

  const handleCreate = () => {
    if (!name || !price) return toast.error("Preencha nome e preço");
    create.mutate({ name, price, category, description });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Produtos & Serviços</h1>
              <p className="text-muted-foreground mt-2">Catálogo de produtos e serviços da sua empresa.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-orange-500 text-white hover:scale-105 flex items-center gap-2 w-fit">
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Criar Produto</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Consultoria Vértice 8x" className="mt-1 bg-input border-border/50" /></div>
                  <div><Label>Descrição</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição breve" className="mt-1 bg-input border-border/50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Preço (R$)</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="0" className="mt-1 bg-input border-border/50" /></div>
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

        {/* Products Grid */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto criado ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product: any, idx: number) => {
                const config = statusColors[product.status || "active"];
                return (
                  <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => del.mutate({ id: product.id })} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
                      {product.description && <p className="text-xs text-muted-foreground mb-3">{product.description}</p>}
                      <p className="text-2xl font-bold mb-3">R$ {Number(product.price).toLocaleString("pt-BR")}</p>
                      {product.category && <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 text-[10px]">{product.category}</Badge>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
