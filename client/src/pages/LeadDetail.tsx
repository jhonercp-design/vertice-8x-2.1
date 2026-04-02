import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  MessageCircle,
  FileText,
  Calendar,
  Clock,
  Send,
  User,
  Bot,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const timelineEvents = [
  {
    id: 1,
    type: "status_change" as const,
    title: "Status alterado para Qualificado",
    description: "Lead qualificado após call de discovery.",
    time: "Hoje, 14:30",
    icon: CheckCircle2,
    color: "text-brand-success",
  },
  {
    id: 2,
    type: "whatsapp" as const,
    title: "Mensagem WhatsApp enviada",
    description: "Olá Carlos, segue o material que conversamos...",
    time: "Hoje, 11:00",
    icon: MessageCircle,
    color: "text-green-400",
  },
  {
    id: 3,
    type: "call" as const,
    title: "Call de Discovery realizada",
    description: "Duração: 32min. Framework SPIN aplicado. Lead demonstrou interesse no módulo de automação.",
    time: "Ontem, 15:00",
    icon: Phone,
    color: "text-blue-400",
  },
  {
    id: 4,
    type: "agc_alert" as const,
    title: "Alerta AGC: Follow-up pendente",
    description: "Lead sem contato há 3 dias. Recomendação: retomar com proposta de valor.",
    time: "Ontem, 10:00",
    icon: AlertTriangle,
    color: "text-brand-warning",
  },
  {
    id: 5,
    type: "diagnostic" as const,
    title: "Diagnóstico de Maturidade concluído",
    description: "Score: 42/100. GAP de receita identificado: R$ 180K/ano. ROI projetado: 340%.",
    time: "3 dias atrás",
    icon: FileText,
    color: "text-primary",
  },
  {
    id: 6,
    type: "note" as const,
    title: "Nota adicionada",
    description: "Carlos mencionou que a empresa está em fase de expansão e precisa estruturar a área comercial.",
    time: "5 dias atrás",
    icon: User,
    color: "text-muted-foreground",
  },
];

export default function LeadDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border/30"
            onClick={() => setLocation("/crm")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">C</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Carlos Silva</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" /> TechCorp LTDA
                  <span className="text-border">|</span>
                  <Mail className="w-3 h-3" /> carlos@techcorp.com
                </div>
              </div>
            </div>
          </div>
          <Badge className="bg-primary/15 text-primary border-0">Qualificado</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="notes">Notas</TabsTrigger>
              </TabsList>

              {/* Timeline */}
              <TabsContent value="timeline" className="space-y-3">
                {timelineEvents.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full bg-card border border-border/30 flex items-center justify-center shrink-0`}>
                        <event.icon className={`w-4 h-4 ${event.color}`} />
                      </div>
                      <div className="w-px flex-1 bg-border/30 mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">
                          {event.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* WhatsApp */}
              <TabsContent value="whatsapp">
                <Card className="border-border/30 bg-card/80">
                  <CardContent className="p-4 space-y-3">
                    <div className="space-y-3 min-h-[300px]">
                      <div className="flex justify-end">
                        <div className="bg-primary/15 text-foreground rounded-lg px-3 py-2 max-w-[70%]">
                          <p className="text-xs">Olá Carlos, segue o material que conversamos sobre estruturação comercial.</p>
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">11:00</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-muted/50 text-foreground rounded-lg px-3 py-2 max-w-[70%]">
                          <p className="text-xs">Obrigado! Vou analisar e te retorno até sexta.</p>
                          <p className="text-[10px] text-muted-foreground mt-1">11:15</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-border/30">
                      <Textarea placeholder="Digite uma mensagem..." className="min-h-[38px] h-[38px] resize-none bg-background/50 border-border/30" />
                      <Button size="icon" className="h-[38px] w-[38px] bg-primary text-primary-foreground shrink-0">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes */}
              <TabsContent value="notes">
                <Card className="border-border/30 bg-card/80">
                  <CardContent className="p-4 space-y-3">
                    <Textarea
                      placeholder="Adicionar uma nota sobre este lead..."
                      className="min-h-[100px] bg-background/50 border-border/30"
                    />
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      onClick={() => toast.success("Nota salva com sucesso")}
                    >
                      Salvar Nota
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Empresa", value: "TechCorp LTDA", icon: Building2 },
                  { label: "Email", value: "carlos@techcorp.com", icon: Mail },
                  { label: "Telefone", value: "(11) 99999-1234", icon: Phone },
                  { label: "Cargo", value: "Diretor Comercial", icon: User },
                  { label: "Fonte", value: "Outbound", icon: Calendar },
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

            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Deal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Valor</span>
                  <span className="text-sm font-bold text-primary">R$ 45.000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Estágio</span>
                  <Badge className="bg-primary/15 text-primary border-0 text-[10px]">Qualificação</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Probabilidade</span>
                  <span className="text-xs font-medium">40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Previsão</span>
                  <span className="text-xs font-medium">15/05/2026</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Maturidade</span>
                  <span className="text-sm font-bold text-brand-warning">42/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">GAP Receita</span>
                  <span className="text-xs font-medium text-brand-danger">R$ 180K/ano</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">ROI Projetado</span>
                  <span className="text-xs font-bold text-brand-success">340%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
