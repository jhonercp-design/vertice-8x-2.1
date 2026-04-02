import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft, Phone, Mail, Building2, MessageCircle, FileText,
  Clock, Send, User, AlertTriangle, CheckCircle2, Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "text-blue-400" },
  contacted: { label: "Contatado", color: "text-purple-400" },
  qualified: { label: "Qualificado", color: "text-primary" },
  proposal: { label: "Proposta", color: "text-brand-warning" },
  negotiation: { label: "Negociação", color: "text-cyan-400" },
  won: { label: "Ganho", color: "text-brand-success" },
  lost: { label: "Perdido", color: "text-brand-danger" },
};

const typeIcons: Record<string, { icon: any; color: string }> = {
  status_change: { icon: CheckCircle2, color: "text-brand-success" },
  whatsapp: { icon: MessageCircle, color: "text-green-400" },
  call: { icon: Phone, color: "text-blue-400" },
  agc_alert: { icon: AlertTriangle, color: "text-brand-warning" },
  diagnostic: { icon: FileText, color: "text-primary" },
  note: { icon: User, color: "text-muted-foreground" },
  email: { icon: Mail, color: "text-purple-400" },
  meeting: { icon: Clock, color: "text-cyan-400" },
  proposal: { icon: FileText, color: "text-brand-warning" },
  task: { icon: CheckCircle2, color: "text-blue-400" },
};

export default function LeadDetail() {
  const params = useParams<{ id: string }>();
  const leadId = Number(params.id);
  const [, setLocation] = useLocation();
  const [noteText, setNoteText] = useState("");

  const utils = trpc.useUtils();
  const { data: lead, isLoading } = trpc.leads.getById.useQuery({ id: leadId });
  const { data: activities = [] } = trpc.activities.getByLead.useQuery({ leadId });
  const { data: dealsList = [] } = trpc.deals.getByLead.useQuery({ leadId });

  const updateMutation = trpc.leads.update.useMutation({
    onSuccess: () => { utils.leads.getById.invalidate({ id: leadId }); toast.success("Lead atualizado!"); },
  });

  const addNoteMutation = trpc.activities.create.useMutation({
    onSuccess: () => { utils.activities.getByLead.invalidate({ leadId }); setNoteText(""); toast.success("Nota salva!"); },
  });

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({ id: leadId, status: status as any });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNoteMutation.mutate({ leadId, type: "note", title: "Nota adicionada", description: noteText });
  };

  if (isLoading) {
    return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (!lead) {
    return <DashboardLayout><div className="text-center py-20"><p className="text-muted-foreground">Lead não encontrado.</p><Button variant="outline" className="mt-4" onClick={() => setLocation("/crm")}>Voltar ao CRM</Button></div></DashboardLayout>;
  }

  const deal = dealsList[0];
  const sc = statusConfig[lead.status] || statusConfig.new;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-8 w-8 border-border/30" onClick={() => setLocation("/crm")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{lead.name?.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{lead.name}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {lead.company && <><Building2 className="w-3 h-3" /> {lead.company}</>}
                  {lead.email && <><span className="text-border">|</span><Mail className="w-3 h-3" /> {lead.email}</>}
                </div>
              </div>
            </div>
          </div>
          <Select value={lead.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-center py-10"><p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p></div>
                ) : (
                  activities.map((event: any) => {
                    const typeInfo = typeIcons[event.type] || typeIcons.note;
                    const Icon = typeInfo.icon;
                    return (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-card border border-border/30 flex items-center justify-center shrink-0">
                            <Icon className={`w-4 h-4 ${typeInfo.color}`} />
                          </div>
                          <div className="w-px flex-1 bg-border/30 mt-2" />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-foreground">{event.title || event.type}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(event.createdAt).toLocaleString("pt-BR")}</span>
                          </div>
                          {event.description && <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="notes">
                <Card className="border-border/30 bg-card/80">
                  <CardContent className="p-4 space-y-3">
                    <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Adicionar uma nota sobre este lead..." className="min-h-[100px] bg-background/50 border-border/30" />
                    <Button size="sm" className="bg-primary text-primary-foreground" onClick={handleAddNote} disabled={addNoteMutation.isPending}>
                      {addNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                      Salvar Nota
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Informações</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Empresa", value: lead.company || "—", icon: Building2 },
                  { label: "Email", value: lead.email || "—", icon: Mail },
                  { label: "Telefone", value: lead.phone || "—", icon: Phone },
                  { label: "Cargo", value: lead.position || "—", icon: User },
                  { label: "Fonte", value: lead.source || "—", icon: Clock },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-3">
                    <info.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{info.label}</p>
                      <p className="text-xs font-medium text-foreground">{info.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {deal && (
              <Card className="border-border/30 bg-card/80">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Deal</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Título</span>
                    <span className="text-xs font-medium">{deal.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Valor</span>
                    <span className="text-sm font-bold text-primary">{deal.value ? `R$ ${Number(deal.value).toLocaleString("pt-BR")}` : "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Estágio</span>
                    <Badge className="bg-primary/15 text-primary border-0 text-[10px]">{deal.stage}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Probabilidade</span>
                    <span className="text-xs font-medium">{deal.probability || 0}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {lead.notes && (
              <Card className="border-border/30 bg-card/80">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Notas Iniciais</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{lead.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
