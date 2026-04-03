import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, Brain } from "lucide-react";

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
      <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Copiloto IA</h1>
              <p className="text-muted-foreground mt-2">Consultor comercial agêntico com contexto da sua operação.</p>
            </div>
            <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 gap-1.5 w-fit">
              <Sparkles className="w-3 h-3" />
              Gemini Pro
            </Badge>
          </div>
        </motion.div>

        {/* Features */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Brain, label: "Análise Estratégica", desc: "Diagnóstico de pipeline e operações" },
              { icon: Zap, label: "Scripts Personalizados", desc: "Geração de prospecção em tempo real" },
              { icon: Bot, label: "Consultoria 24/7", desc: "Suporte comercial sempre disponível" },
            ].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                <div className="group relative overflow-hidden rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-orange-500 opacity-10 w-fit mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{feature.label}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Chat */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }} className="flex-1 flex flex-col">
          <div className="flex-1 rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <AIChatBox
              messages={messages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending}
              placeholder="Pergunte ao Copiloto sobre estratégia comercial..."
            />
          </div>
        </motion.div>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="group relative overflow-hidden rounded-lg border border-border/30 bg-gradient-to-br from-card/80 to-card/40 p-3 text-left text-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:scale-105"
              >
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">{prompt}</p>
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
