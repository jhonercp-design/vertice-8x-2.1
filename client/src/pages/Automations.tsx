import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Zap,
  Plus,
  MessageCircle,
  Users,
  Mail,
  Bell,
  ArrowRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const automations = [
  {
    id: 1,
    name: "Follow-up Automático",
    trigger: "Lead sem contato há 3 dias",
    triggerIcon: Clock,
    action: "Enviar WhatsApp com script de reativação",
    actionIcon: MessageCircle,
    isActive: true,
    executions: 47,
    lastRun: "Hoje, 14:00",
  },
  {
    id: 2,
    name: "Boas-vindas Novo Lead",
    trigger: "Novo lead criado no CRM",
    triggerIcon: Users,
    action: "Enviar mensagem de boas-vindas via WhatsApp",
    actionIcon: MessageCircle,
    isActive: true,
    executions: 123,
    lastRun: "Hoje, 10:30",
  },
  {
    id: 3,
    name: "Alerta de Deal Parado",
    trigger: "Deal sem movimentação há 7 dias",
    triggerIcon: Clock,
    action: "Notificar responsável por email",
    actionIcon: Mail,
    isActive: false,
    executions: 15,
    lastRun: "Ontem, 18:00",
  },
  {
    id: 4,
    name: "Alerta AGC Crítico",
    trigger: "AGC emite alerta crítico",
    triggerIcon: Bell,
    action: "Notificar equipe via WhatsApp",
    actionIcon: MessageCircle,
    isActive: true,
    executions: 8,
    lastRun: "Hoje, 12:00",
  },
];

export default function Automations() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Automações Inteligentes</h1>
              <p className="text-xs text-muted-foreground">
                Gatilhos automáticos baseados em eventos do CRM e alertas do AGC
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground"
            onClick={() => toast("Funcionalidade em breve", { description: "Criação de automações será habilitada na próxima atualização." })}
          >
            <Plus className="w-4 h-4 mr-1" /> Nova Automação
          </Button>
        </div>

        {/* Automations List */}
        <div className="space-y-3">
          {automations.map((auto, i) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className={`border-border/30 bg-card/80 transition-all ${auto.isActive ? "hover:border-primary/20" : "opacity-60"}`}>
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-sm text-foreground">{auto.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${auto.isActive ? "border-brand-success/30 text-brand-success" : "border-border/40 text-muted-foreground"}`}
                        >
                          {auto.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                          <auto.triggerIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-foreground">{auto.trigger}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
                          <auto.actionIcon className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs text-primary">{auto.action}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                        <span>{auto.executions} execuções</span>
                        <span>Última: {auto.lastRun}</span>
                      </div>
                    </div>
                    <Switch checked={auto.isActive} className="shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
