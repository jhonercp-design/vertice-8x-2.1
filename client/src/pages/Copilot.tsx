import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

const SYSTEM_PROMPT = `Você é o Copiloto IA da Máquina de Vendas Vértice 8x. Você é um consultor comercial de elite especializado em:
- Frameworks comerciais (SPIN Selling, Challenger Sale, BANT, MEDDIC)
- Análise de pipeline e previsão de receita
- Geração de scripts de prospecção personalizados
- Diagnóstico de operações comerciais B2B
- Estratégias de outbound e inbound marketing

Seu tom é executivo, direto e racional. Você antecipa problemas, sugere ações concretas e sempre fundamenta suas recomendações em dados e frameworks validados. Responda sempre em português brasileiro.`;

const suggestedPrompts = [
  "Gere um script de prospecção para empresas de tecnologia",
  "Analise meu pipeline e sugira onde focar",
  "Quais métricas devo acompanhar semanalmente?",
  "Monte um plano de ação para aumentar a taxa de conversão",
];

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: SYSTEM_PROMPT },
  ]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.content },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        },
      ]);
    },
  });

  const handleSend = (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Copiloto IA</h1>
              <p className="text-xs text-muted-foreground">
                Consultor comercial agêntico com contexto da sua operação
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary gap-1.5">
            <Sparkles className="w-3 h-3" />
            Gemini
          </Badge>
        </div>

        {/* Chat */}
        <AIChatBox
          messages={messages}
          onSendMessage={handleSend}
          isLoading={chatMutation.isPending}
          placeholder="Pergunte ao Copiloto sobre estratégia comercial..."
          height="calc(100vh - 12rem)"
          emptyStateMessage="Seu consultor comercial de IA está pronto. Como posso ajudar?"
          suggestedPrompts={suggestedPrompts}
          className="border-border/30 bg-card/80"
        />
      </div>
    </DashboardLayout>
  );
}
