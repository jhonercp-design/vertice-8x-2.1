import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CallAnalytics() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [transcription, setTranscription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: transcriptions, isLoading, refetch } = trpc.callAnalytics.list.useQuery();
  const { data: analyses } = trpc.callAnalytics.getAnalyses.useQuery();

  const createMutation = trpc.callAnalytics.create.useMutation();
  const analyzeMutation = trpc.callAnalytics.analyze.useMutation();

  const handleCreate = async () => {
    if (!title.trim() || !transcription.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({ title, transcription });
      setTitle("");
      setTranscription("");
      setIsOpen(false);
      refetch();
      toast.success("Transcrição criada com sucesso");

      // Auto-analyze
      setIsAnalyzing(true);
      await analyzeMutation.mutateAsync({
        transcriptionId: result.id,
        transcription,
      });
      refetch();
      toast.success("Análise concluída!");
      setIsAnalyzing(false);
    } catch (error) {
      toast.error("Erro ao criar transcrição");
    }
  };

  const stats = [
    { label: "Total de Chamadas", value: transcriptions?.length || 0, icon: BarChart3, color: "from-blue-500 to-blue-600" },
    { label: "Analisadas", value: analyses?.length || 0, icon: CheckCircle2, color: "from-green-500 to-green-600" },
    { label: "Score Médio", value: analyses?.length ? Math.round((analyses.reduce((sum, a) => sum + (a.score || 0), 0) / analyses.length)) : 0, icon: TrendingUp, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-2">
                Gestor Comercial de IA
              </h1>
              <p className="text-slate-400 text-lg">Analise transcrições de chamadas e otimize sua performance</p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                  <Plus size={20} /> Nova Análise
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Adicionar Transcrição</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Título da chamada"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                  <Textarea
                    placeholder="Cole a transcrição da chamada aqui..."
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 min-h-[200px]"
                  />
                  <Button
                    onClick={handleCreate}
                    disabled={isAnalyzing || createMutation.isPending}
                    className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Analisando...
                      </>
                    ) : (
                      "Analisar Chamada"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-6 hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                      <p className="text-4xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stat.color} p-4 rounded-lg`}>
                      <stat.icon size={24} className="text-white" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Transcriptions List */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Transcrições Recentes</h2>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-400" size={32} />
              </div>
            ) : transcriptions?.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-12 text-center">
                <AlertCircle className="mx-auto mb-4 text-slate-500" size={48} />
                <p className="text-slate-400">Nenhuma transcrição adicionada ainda</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {transcriptions?.map((trans, i) => {
                  const analysis = analyses?.find((a) => a.transcriptionId === trans.id);
                  return (
                    <motion.div key={trans.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 p-6 hover:border-slate-600 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">{trans.title}</h3>
                            <p className="text-slate-400 text-sm mb-3 line-clamp-2">{trans.transcription}</p>
                            <div className="flex gap-4 text-xs text-slate-500">
                              <span>Status: {trans.status}</span>
                              <span>{new Date(trans.createdAt).toLocaleDateString("pt-BR")}</span>
                            </div>
                          </div>
                          {analysis && (
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${(analysis.score || 0) >= 70 ? "text-green-400" : (analysis.score || 0) >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                                {analysis.score || 0}%
                              </div>
                              <p className="text-slate-400 text-sm">Score</p>
                              <p className="text-slate-500 text-xs capitalize mt-2">{analysis.sentiment}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
