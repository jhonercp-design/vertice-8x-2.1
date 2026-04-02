import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  QrCode,
  Wifi,
  WifiOff,
  Send,
  Search,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const mockContacts = [
  { id: 1, name: "Carlos Silva", phone: "+55 11 99999-1234", lastMessage: "Vou analisar e te retorno até sexta.", time: "11:15", unread: 0 },
  { id: 2, name: "Ana Rodrigues", phone: "+55 21 98888-5678", lastMessage: "Perfeito, vamos agendar a reunião.", time: "10:30", unread: 2 },
  { id: 3, name: "Pedro Santos", phone: "+55 31 97777-9012", lastMessage: "Obrigado pelo material!", time: "Ontem", unread: 0 },
  { id: 4, name: "Maria Oliveira", phone: "+55 41 96666-3456", lastMessage: "Podemos conversar amanhã?", time: "Ontem", unread: 1 },
];

const mockMessages = [
  { id: 1, fromMe: true, content: "Olá Carlos, tudo bem? Segue o material sobre estruturação comercial que conversamos.", time: "11:00" },
  { id: 2, fromMe: false, content: "Olá! Tudo ótimo. Obrigado pelo envio!", time: "11:10" },
  { id: 3, fromMe: false, content: "Vou analisar e te retorno até sexta.", time: "11:15" },
];

export default function WhatsApp() {
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [message, setMessage] = useState("");
  const [isConnected] = useState(false);
  const [search, setSearch] = useState("");

  const filteredContacts = mockContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">WhatsApp Multi-Atendente</h1>
              <p className="text-xs text-muted-foreground">
                Chat em tempo real com sincronização no CRM
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`gap-1.5 ${isConnected ? "border-green-500/30 text-green-400" : "border-brand-danger/30 text-brand-danger"}`}
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>

        {/* Main Chat Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-14rem)]">
          {/* Contacts List */}
          <Card className="border-border/30 bg-card/80 md:col-span-1 flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contato..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-xs bg-background/50 border-border/30"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left px-3 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors ${
                      selectedContact?.id === contact.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-green-400">
                          {contact.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {contact.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{contact.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[11px] text-muted-foreground truncate pr-2">
                            {contact.lastMessage}
                          </span>
                          {contact.unread > 0 && (
                            <span className="w-4 h-4 rounded-full bg-green-500 text-[9px] text-white flex items-center justify-center shrink-0">
                              {contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
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
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Escaneie o QR Code com o WhatsApp do seu celular para conectar e começar a atender.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                  onClick={() => toast("Funcionalidade em breve", { description: "A conexão WhatsApp será habilitada na próxima atualização." })}
                >
                  <QrCode className="w-4 h-4 mr-1" /> Gerar QR Code
                </Button>
              </CardContent>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-3 border-b border-border/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-400">
                      {selectedContact?.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{selectedContact?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedContact?.phone}</p>
                  </div>
                </div>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {mockMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                        <div className={`rounded-lg px-3 py-2 max-w-[70%] ${msg.fromMe ? "bg-green-600/20 text-foreground" : "bg-muted/50 text-foreground"}`}>
                          <p className="text-xs">{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 text-right">{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {/* Input */}
                <div className="p-3 border-t border-border/30 flex gap-2">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite uma mensagem..."
                    className="min-h-[38px] h-[38px] resize-none bg-background/50 border-border/30"
                  />
                  <Button size="icon" className="h-[38px] w-[38px] bg-green-600 text-white shrink-0">
                    <Send className="w-4 h-4" />
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
