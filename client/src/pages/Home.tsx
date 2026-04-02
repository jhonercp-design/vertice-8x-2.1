import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import {
  Gauge,
  Route,
  Bot,
  ShieldCheck,
  Users,
  MessageCircle,
  Zap,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

const features = [
  {
    icon: Gauge,
    title: "Cockpit de Comando",
    desc: "Dashboard executivo com termômetro de gestão em tempo real.",
  },
  {
    icon: Route,
    title: "Trilha de Transformação",
    desc: "5 pilares do Método Vértice com desbloqueio progressivo.",
  },
  {
    icon: Bot,
    title: "Copiloto IA Agêntico",
    desc: "Antecipa problemas, gera scripts e analisa pipeline.",
  },
  {
    icon: ShieldCheck,
    title: "AGC - Governança",
    desc: "Audita calls e campanhas de hora em hora, 7h às 19h.",
  },
  {
    icon: Users,
    title: "CRM Integrado",
    desc: "Timeline unificada com todas as interações do lead.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Multi-Atendente",
    desc: "QR Code, chat em tempo real e sync automático no CRM.",
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [loading, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">Máquina de Vendas</span>
              <span className="text-[10px] text-muted-foreground ml-2 uppercase tracking-widest font-medium">
                Vértice 8x
              </span>
            </div>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Acessar <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary live-indicator" />
              Plataforma de Gestão Comercial Estratégica
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              O cockpit que transforma{" "}
              <span className="text-primary">consultoria em receita</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Diagnóstico, CRM, automação e inteligência artificial em uma única
              plataforma. Construída para consultores e empresas B2B que exigem
              resultados reais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg glow-orange text-base px-8"
              >
                Começar Agora <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Arquitetura Comercial Completa
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cada módulo foi projetado para funcionar como um instrumento de
              comando estratégico.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="metric-card p-6 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-2 text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Método Vértice
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            5 pilares que transformam operações comerciais em máquinas de
            receita previsível.
          </p>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            {["Anatomia", "Arquitetura", "Ativação", "Aceleração", "Autoridade"].map(
              (pillar, i) => (
                <motion.div
                  key={pillar}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.1 }}
                  className="flex-1 p-4 rounded-xl border border-border/30 bg-card/50 hover:border-primary/30 transition-all"
                >
                  <div className="text-xs text-primary font-bold mb-1">
                    0{i + 1}
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {pillar}
                  </div>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Máquina de Vendas
            </span>
            <span className="text-xs text-muted-foreground">
              por Vértice 8x | Alpha Consultoria
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
