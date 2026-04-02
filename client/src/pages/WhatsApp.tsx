import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import {
  MessageCircle, QrCode, Wifi, WifiOff, Send, Search, Loader2,
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">WhatsApp Multi-Atendente</h1>
              <p className="text-xs text-muted-foreground">Chat em tempo real com sincronização no CRM</p>
            </div>
          </div>
          <Badge variant="outline" className={`gap-1.5 ${isConnected ? "border-green-500/30 text-green-400" : "border-brand-danger/30 text-brand-danger"}`}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
          {/* Contacts from Leads */}
          <Card className="border-border/30 bg-card/80 md:col-span-1 flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar contato..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-xs bg-background/50 border-border/30" />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {leadsLoading ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
                ) : contacts.length === 0 ? (
                  <div className="text-center py-10 px-3"><p className="text-xs text-muted-foreground">Nenhum lead com telefone cadastrado. Adicione leads no CRM.</p></div>
                ) : (
                  contacts.map((contact: any) => (
                    <button key={contact.id} onClick={() => setSelectedLeadId(contact.id)} className={`w-full text-left px-3 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors ${selectedLeadId === contact.id ? "bg-muted/50" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-green-400">{contact.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground truncate">{contact.name}</span>
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate">{contact.phone}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="border-border/30 bg-card/80 md:col-span-2 flex flex-col">
            {!isConnected ? (
              <CardContent className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <div className="w-48 h-48 rounded-xl border-2 border-dashed border-border/40 flex items-center justify-center bg-muted/20">
                  <QrCode className="w-24 h-24 text-muted-foreground/30" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm mb-1">Conecte seu WhatsApp</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">Clique para ativar o modo de chat. Integração real com Evolution API disponível em breve.</p>
                </div>
                <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={handleConnect}>
                  <QrCode className="w-4 h-4 mr-1" /> Conectar (Modo Chat)
                </Button>
              </CardContent>
            ) : !selectedLeadId ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Selecione um contato para iniciar a conversa.</p>
              </CardContent>
            ) : (
              <>
                <div className="p-3 border-b border-border/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-400">{selectedLead?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{selectedLead?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedLead?.phone}</p>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4" ref={scrollRef}>
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-10"><p className="text-xs text-muted-foreground">Nenhuma mensagem ainda. Envie a primeira!</p></div>
                    ) : (
                      messages.map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                          <div className={`rounded-lg px-3 py-2 max-w-[70%] ${msg.direction === "outbound" ? "bg-green-600/20 text-foreground" : "bg-muted/50 text-foreground"}`}>
                            <p className="text-xs">{msg.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="p-3 border-t border-border/30 flex gap-2">
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Digite uma mensagem..." className="min-h-[38px] h-[38px] resize-none bg-background/50 border-border/30" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
                  <Button size="icon" className="h-[38px] w-[38px] bg-green-600 text-white shrink-0" onClick={handleSend} disabled={sendMutation.isPending}>
                    {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
