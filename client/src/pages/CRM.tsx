import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Mock leads data
const mockLeads = [
  { id: 1, name: "Carlos Silva", company: "TechCorp LTDA", email: "carlos@techcorp.com", phone: "(11) 99999-1234", status: "qualified" as const, value: 45000, source: "Outbound", lastContact: "2 dias atrás" },
  { id: 2, name: "Ana Rodrigues", company: "DataFlow S.A.", email: "ana@dataflow.com", phone: "(21) 98888-5678", status: "proposal" as const, value: 120000, source: "Inbound", lastContact: "Hoje" },
  { id: 3, name: "Pedro Santos", company: "CloudBase Inc", email: "pedro@cloudbase.io", phone: "(31) 97777-9012", status: "new" as const, value: 25000, source: "Indicação", lastContact: "5 dias atrás" },
  { id: 4, name: "Maria Oliveira", company: "SaaS Brasil", email: "maria@saasbrasil.com", phone: "(41) 96666-3456", status: "negotiation" as const, value: 85000, source: "LinkedIn", lastContact: "1 dia atrás" },
  { id: 5, name: "João Costa", company: "Fintech Pro", email: "joao@fintechpro.com", phone: "(51) 95555-7890", status: "contacted" as const, value: 60000, source: "Outbound", lastContact: "3 dias atrás" },
  { id: 6, name: "Lucia Ferreira", company: "E-commerce Plus", email: "lucia@ecomplus.com", phone: "(61) 94444-2345", status: "won" as const, value: 150000, source: "Evento", lastContact: "Hoje" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Novo", color: "text-blue-400", bg: "bg-blue-400/15" },
  contacted: { label: "Contatado", color: "text-purple-400", bg: "bg-purple-400/15" },
  qualified: { label: "Qualificado", color: "text-primary", bg: "bg-primary/15" },
  proposal: { label: "Proposta", color: "text-brand-warning", bg: "bg-brand-warning/15" },
  negotiation: { label: "Negociação", color: "text-cyan-400", bg: "bg-cyan-400/15" },
  won: { label: "Ganho", color: "text-brand-success", bg: "bg-brand-success/15" },
  lost: { label: "Perdido", color: "text-brand-danger", bg: "bg-brand-danger/15" },
};

const pipelineStages = [
  { key: "new", label: "Novos", count: 1 },
  { key: "contacted", label: "Contatados", count: 1 },
  { key: "qualified", label: "Qualificados", count: 1 },
  { key: "proposal", label: "Proposta", count: 1 },
  { key: "negotiation", label: "Negociação", count: 1 },
  { key: "won", label: "Ganhos", count: 1 },
];

export default function CRM() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();

  const filteredLeads = mockLeads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestão de leads, deals e timeline unificada.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => toast("Funcionalidade em breve", { description: "Criação de leads será habilitada na próxima atualização." })}
          >
            <Plus className="w-4 h-4 mr-1" /> Novo Lead
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            </TabsList>
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-card/80 border-border/30"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 border-border/30">
                <Filter className="w-4 h-4 mr-1" /> Filtrar
              </Button>
            </div>
          </div>

          {/* List View */}
          <TabsContent value="list" className="space-y-2">
            {filteredLeads.map((lead, i) => {
              const status = statusConfig[lead.status];
              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className="border-border/30 bg-card/80 hover:border-primary/20 transition-all cursor-pointer"
                    onClick={() => setLocation(`/crm/lead/${lead.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {lead.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {lead.name}
                            </span>
                            <Badge className={`${status.bg} ${status.color} border-0 text-[10px]`}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {lead.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </span>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              R$ {lead.value.toLocaleString("pt-BR")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{lead.lastContact}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* Pipeline View */}
          <TabsContent value="pipeline">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {pipelineStages.map((stage) => {
                const stageLeads = mockLeads.filter((l) => l.status === stage.key);
                const config = statusConfig[stage.key];
                return (
                  <div key={stage.key} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        {stageLeads.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 min-h-[200px]">
                      {stageLeads.map((lead) => (
                        <Card
                          key={lead.id}
                          className="border-border/30 bg-card/80 hover:border-primary/20 transition-all cursor-pointer"
                          onClick={() => setLocation(`/crm/lead/${lead.id}`)}
                        >
                          <CardContent className="p-3">
                            <p className="text-xs font-semibold text-foreground truncate mb-1">
                              {lead.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate mb-2">
                              {lead.company}
                            </p>
                            <p className="text-xs font-bold text-primary">
                              R$ {(lead.value / 1000).toFixed(0)}K
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
