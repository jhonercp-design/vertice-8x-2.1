import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Star, Flame, Target, Award } from "lucide-react";

const ranks = [
  { min: 0, label: "Bronze", color: "text-orange-700", bg: "bg-orange-500/20" },
  { min: 100, label: "Prata", color: "text-gray-400", bg: "bg-gray-500/20" },
  { min: 300, label: "Ouro", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  { min: 600, label: "Platina", color: "text-cyan-400", bg: "bg-cyan-500/20" },
  { min: 1000, label: "Diamante", color: "text-purple-400", bg: "bg-purple-500/20" },
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
  const { data: deals = [] } = trpc.deals.list.useQuery();

  // Calculate auto-achievements
  const unlockedAchievements = new Set<string>();
  if (leads.length >= 1) unlockedAchievements.add("Primeiro Lead");
  if (leads.length >= 10) unlockedAchievements.add("10 Leads");
  if (deals.length >= 1) unlockedAchievements.add("Primeiro Deal");
  if (deals.some((d: any) => d.stage === "won")) unlockedAchievements.add("Primeira Venda");

  const autoPoints = achievements.filter((a) => unlockedAchievements.has(a.label)).reduce((acc, a) => acc + a.points, 0);
  const dbPoints = scores.reduce((acc: number, s: any) => acc + Number(s.totalPoints || 0), 0);
  const totalPoints = autoPoints + dbPoints;
  const rank = getRank(totalPoints);
  const nextRank = ranks.find((r) => r.min > totalPoints);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold tracking-tight">Gamificação</h1><p className="text-muted-foreground">Conquistas, ranking e pontuação da equipe</p></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className={`p-4 rounded-full ${rank.bg} mb-4`}><Trophy className={`h-10 w-10 ${rank.color}`} /></div>
              <p className={`text-2xl font-bold ${rank.color}`}>{rank.label}</p>
              <p className="text-3xl font-bold mt-2">{totalPoints}</p>
              <p className="text-sm text-muted-foreground">pontos totais</p>
              {nextRank && (
                <div className="mt-4 w-full px-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>{rank.label}</span><span>{nextRank.label}</span></div>
                  <div className="w-full bg-muted rounded-full h-2"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, ((totalPoints - rank.min) / (nextRank.min - rank.min)) * 100)}%` }} /></div>
                  <p className="text-xs text-muted-foreground text-center mt-1">{nextRank.min - totalPoints} pontos para {nextRank.label}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Conquistas</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((a) => {
                  const unlocked = unlockedAchievements.has(a.label);
                  return (
                    <div key={a.label} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${unlocked ? "bg-primary/10 border border-primary/20" : "bg-muted/30 opacity-60"}`}>
                      <div className={`p-2 rounded-lg ${unlocked ? "bg-primary/20" : "bg-muted"}`}><a.icon className={`h-5 w-5 ${unlocked ? "text-primary" : "text-muted-foreground"}`} /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{a.label}</p>
                          <Badge variant={unlocked ? "default" : "secondary"} className="text-xs">{a.points} pts</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {scores.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Ranking da Equipe</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scores.sort((a: any, b: any) => Number(b.totalPoints) - Number(a.totalPoints)).map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-700" : "text-muted-foreground"}`}>#{i + 1}</span>
                      <span className="font-medium text-sm">Usuário {s.userId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{Number(s.totalPoints || 0)} pts</span>
                      <Badge className={getRank(Number(s.totalPoints || 0)).bg}>{getRank(Number(s.totalPoints || 0)).label}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
