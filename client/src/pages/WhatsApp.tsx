import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  MessageCircle, QrCode, Wifi, WifiOff, Send, Search, Loader2, Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function WhatsApp() {
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const { data: leads = [], isLoading: leadsLoading } = trpc.leads.list.useQuery();
  const { data: messages = [] } = trpc.whatsapp.messages.useQuery(
    { leadId: selectedLeadId! },
    { enabled: !!selectedLeadId, refetchInterval: isConnected ? 5000 : false }
  );

  const sendMutation = trpc.whatsapp.send.useMutation({
    onSuccess: () => {
      utils.whatsapp.messages.invalidate({ leadId: selectedLeadId! });
      setMessage("");
    },
    onError: (err) => toast.error(err.message),
  });

  // Filter leads that have phone
  const contacts = leads.filter((l: any) =>
    l.phone && l.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLead = leads.find((l: any) => l.id === selectedLeadId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedLeadId) return;
    sendMutation.mutate({ leadId: selectedLeadId, remoteJid: selectedLead?.phone || "", content: message });
  };

  const handleConnect = () => {
    setIsConnected(true);
    toast.success("WhatsApp conectado!", { description: "Modo simulado ativo. Integração real com Evolution API/Baileys disponível em breve." });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">WhatsApp Multi-Atendente</h1>
              <p className="text-muted-foreground mt-2">Chat em tempo real com sincronização no CRM.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleConnect} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${isConnected ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {isConnected ? <Wifi className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                {isConnected ? "Conectado" : "Conectar"}
              </button>
              <Badge className={`${isConnected ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"} border gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                {isConnected ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
          {/* Contacts */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="flex flex-col">
            <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-border/30">
                <h2 className="font-semibold mb-3">Contatos</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-border/50" />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {leadsLoading ? (
                    <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhum contato</p>
                    </div>
                  ) : (
                    contacts.map((lead: any) => (
                      <motion.button key={lead.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => setSelectedLeadId(lead.id)} className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${selectedLeadId === lead.id ? "bg-primary/10 border border-primary/30" : "hover:bg-card/50"}`}>
                        <p className="text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
                      </motion.button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>

          {/* Chat */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className="md:col-span-2 flex flex-col">
            {selectedLead ? (
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b border-border/30">
                  <h3 className="font-semibold">{selectedLead.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedLead.phone}</p>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1" ref={scrollRef}>
                  <div className="p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Nenhuma mensagem</p>
                      </div>
                    ) : (
                      messages.map((msg: any, idx: number) => (
                        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.direction === "out" ? "bg-primary/10 text-foreground border border-primary/20" : "bg-card/50 text-foreground border border-border/30"}`}>
                            <p>{msg.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border/30 space-y-2">
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Digite sua mensagem..." className="min-h-[60px] bg-input border-border/50 resize-none" />
                  <Button onClick={handleSend} disabled={sendMutation.isPending || !message.trim()} className="w-full bg-gradient-to-r from-primary to-orange-500 hover:scale-105">
                    {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                    Enviar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Selecione um contato para começar</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
