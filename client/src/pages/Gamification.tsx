import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, Flame, Target, Award } from "lucide-react";

const ranks = [
  { min: 0, label: "Bronze", gradient: "from-orange-600 to-orange-700" },
  { min: 100, label: "Prata", gradient: "from-gray-400 to-gray-500" },
  { min: 300, label: "Ouro", gradient: "from-yellow-500 to-yellow-600" },
  { min: 600, label: "Platina", gradient: "from-cyan-400 to-cyan-500" },
  { min: 1000, label: "Diamante", gradient: "from-purple-400 to-purple-500" },
];

function getRank(points: number) {
  return [...ranks].reverse().find((r) => points >= r.min) || ranks[0];
}

const achievements = [
  { icon: Flame, label: "Primeiro Lead", description: "Cadastre seu primeiro lead no CRM", points: 10 },
  { icon: Target, label: "Primeiro Deal", description: "Crie seu primeiro deal no pipeline", points: 20 },
  { icon: Star, label: "Primeira Venda", description: "Feche seu primeiro deal como ganho", points: 50 },
  { icon: Medal, label: "10 Leads", description: "Cadastre 10 leads no CRM", points: 30 },
  { icon: Award, label: "Playbook Criado", description: "Crie seu primeiro playbook de vendas", points: 15 },
  { icon: Trophy, label: "Meta Batida", description: "Atinja 100% de uma meta", points: 100 },
];

export default function Gamification() {
  const { data: scores = [] } = trpc.gamification.scores.useQuery();
  const { data: leads = [] } = trpc.leads.list.useQuery({});

  const totalPoints = scores.reduce((sum: number, s: any) => sum + Number(s.points || 0), 0);
  const userRank = getRank(totalPoints);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Gamificação</h1>
            <p className="text-muted-foreground mt-2">Conquistas, pontos e ranking da equipe.</p>
          </div>
        </motion.div>

        {/* User Rank */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className={`rounded-xl border border-border/30 bg-gradient-to-br ${userRank.gradient} opacity-10 backdrop-blur-sm p-8 text-center`}>
            <div className="inline-block p-4 rounded-full bg-gradient-to-br from-primary to-orange-500 mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Seu Rank: {userRank.label}</h2>
            <p className="text-lg font-semibold mb-1">{totalPoints} pontos</p>
            <div className="w-full bg-border/30 rounded-full h-3 mt-4">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${Math.min((totalPoints / 1000) * 100, 100)}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-lg font-bold">Conquistas Disponíveis</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {achievements.map((achievement, idx) => {
                const Icon = achievement.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                    <div className="group relative overflow-hidden rounded-lg border border-border/30 bg-card/50 p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white border-0 text-[10px]">{achievement.points} pts</Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{achievement.label}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-border/30">
              <h2 className="text-lg font-bold">Ranking da Equipe</h2>
            </div>
            <div className="p-6">
              {scores.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum score registrado</p>
              ) : (
                <div className="space-y-2">
                  {scores.slice(0, 10).map((score: any, idx: number) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-card/50 hover:bg-card/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Usuário {idx + 1}</p>
                            <p className="text-xs text-muted-foreground">{score.points} pontos</p>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white border-0">{getRank(score.points).label}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
