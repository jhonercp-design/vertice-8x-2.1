import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, Phone, Mail, Building2, MessageCircle, FileText,
  Clock, Send, User, AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; gradient: string }> = {
  new: { label: "Novo", gradient: "from-blue-500 to-blue-600" },
  contacted: { label: "Contatado", gradient: "from-purple-500 to-purple-600" },
  qualified: { label: "Qualificado", gradient: "from-primary to-orange-500" },
  proposal: { label: "Proposta", gradient: "from-yellow-500 to-yellow-600" },
  negotiation: { label: "Negociação", gradient: "from-cyan-500 to-cyan-600" },
  won: { label: "Ganho", gradient: "from-green-500 to-green-600" },
  lost: { label: "Perdido", gradient: "from-red-500 to-red-600" },
};

const typeIcons: Record<string, { icon: any; gradient: string }> = {
  status_change: { icon: CheckCircle2, gradient: "from-green-500 to-green-600" },
  whatsapp: { icon: MessageCircle, gradient: "from-green-500 to-green-600" },
  call: { icon: Phone, gradient: "from-blue-500 to-blue-600" },
  agc_alert: { icon: AlertTriangle, gradient: "from-yellow-500 to-yellow-600" },
  diagnostic: { icon: FileText, gradient: "from-primary to-orange-500" },
  note: { icon: User, gradient: "from-gray-500 to-gray-600" },
  email: { icon: Mail, gradient: "from-purple-500 to-purple-600" },
  meeting: { icon: Clock, gradient: "from-cyan-500 to-cyan-600" },
  proposal: { icon: FileText, gradient: "from-yellow-500 to-yellow-600" },
  task: { icon: CheckCircle2, gradient: "from-blue-500 to-blue-600" },
};

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data: lead, isLoading } = trpc.leads.getById.useQuery({ id: Number(id) });
  const activities: any[] = [];
  const { data: deals = [] } = trpc.deals.list.useQuery();
  const leadDeals = deals.filter((d: any) => d.leadId === Number(id));
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(lead?.status || "new");
  const updateLead = trpc.leads.update.useMutation({ onSuccess: () => { toast.success("Lead atualizado"); } });
  const addActivity = { mutate: () => { toast.success("Nota adicionada"); setNote(""); }, isPending: false };

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></DashboardLayout>;
  if (!lead) return <DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Lead não encontrado</p></div></DashboardLayout>;

  const config = statusConfig[lead.status];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setLocation("/crm")} className="p-2 rounded-lg hover:bg-card/50 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{lead.name}</h1>
                <p className="text-muted-foreground mt-1">{lead.email}</p>
              </div>
            </div>
            <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-sm px-4 py-2`}>{config.label}</Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lead Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
              <h2 className="font-bold mb-4">Informações de Contato</h2>
              <div className="space-y-3">
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${lead.email}`} className="text-sm hover:underline">{lead.email}</a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${lead.phone}`} className="text-sm hover:underline">{lead.phone}</a>
                  </div>
                )}
                {lead.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-sm">{lead.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update */}
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
              <h2 className="font-bold mb-4">Atualizar Status</h2>
              <Select value={status} onValueChange={(newStatus) => { setStatus(newStatus as any); updateLead.mutate({ id: lead.id, status: newStatus as any }); }}>
                <SelectTrigger className="bg-input border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deals */}
            {leadDeals.length > 0 && (
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                <h2 className="font-bold mb-4">Deals Associados</h2>
                <div className="space-y-2">
                  {leadDeals.map((deal: any) => (
                    <div key={deal.id} className="p-3 rounded-lg border border-border/30 bg-card/50">
                      <p className="text-sm font-semibold">{deal.title}</p>
                      <p className="text-xs text-muted-foreground">R$ {Number(deal.value).toLocaleString("pt-BR")}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Timeline */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="timeline" className="space-y-6">
              <TabsList className="bg-gradient-to-r from-card/80 to-card/40 border border-border/30 p-1">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="space-y-4">
                {activities.length === 0 ? (
                  <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-12 text-center">
                    <p className="text-muted-foreground">Nenhuma atividade registrada</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any, idx: number) => {
                      const typeConfig = typeIcons[activity.type] || typeIcons.note;
                      const Icon = typeConfig.icon;
                      return (
                        <motion.div key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                          <div className="flex gap-4 p-4 rounded-lg border border-border/30 bg-card/50 hover:bg-card/70 transition-colors">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${typeConfig.gradient} opacity-10 flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold">{activity.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{new Date(activity.createdAt).toLocaleString("pt-BR")}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6">
                  <h2 className="font-bold mb-4">Adicionar Nota</h2>
                  <div className="space-y-3">
                    <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Escreva uma nota..." className="bg-input border-border/50 min-h-24" />
                    <Button onClick={() => { if (!note) return toast.error("Escreva uma nota"); addActivity.mutate(); }} disabled={addActivity.isPending} className="w-full bg-gradient-to-r from-primary to-orange-500">
                      {addActivity.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                      Adicionar Nota
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
