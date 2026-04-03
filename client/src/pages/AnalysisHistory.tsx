import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, TrendingUp, CheckCircle2, Clock, Filter } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalysisHistory() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data
  const { data: alerts = [], isLoading: alertsLoading } = trpc.analysisHistory.getAlerts.useQuery();
  const { data: summary = { total: 0, bySeverity: {}, acknowledged: 0 } } = trpc.analysisHistory.getSummary.useQuery();
  const updateStatusMutation = trpc.analysisHistory.updateStatus.useMutation();

  // Filter and process data
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    // Apply date range filter
    const now = new Date();
    const startDate = new Date();
    if (dateRange === "7d") startDate.setDate(now.getDate() - 7);
    else if (dateRange === "30d") startDate.setDate(now.getDate() - 30);
    else if (dateRange === "90d") startDate.setDate(now.getDate() - 90);
    else startDate.setFullYear(2000);

    filtered = filtered.filter((a) => new Date(a.createdAt) >= startDate);

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return filtered;
  }, [alerts, dateRange, severityFilter, categoryFilter, searchTerm]);

  // Timeline data
  const timelineData = useMemo(() => {
    const groupedByDate: Record<string, number> = {};
    filteredAlerts.forEach((alert) => {
      const date = new Date(alert.createdAt).toLocaleDateString("pt-BR");
      groupedByDate[date] = (groupedByDate[date] || 0) + 1;
    });
    return Object.entries(groupedByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredAlerts]);

  // Severity distribution
  const severityData = useMemo(() => {
    const colors: Record<string, string> = {
      critical: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    const bySev = summary.bySeverity as Record<string, number> || {};
    return Object.entries(bySev).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      value: count,
      color: colors[severity] || "#6b7280",
    }));
  }, [summary.bySeverity]);

  // Category distribution
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredAlerts.forEach((alert) => {
      grouped[alert.category] = (grouped[alert.category] || 0) + 1;
    });
    return Object.entries(grouped).map(([category, count]) => ({
      name: category,
      value: count,
    }));
  }, [filteredAlerts]);

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "warning":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      case "info":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      case "warning":
        return <TrendingUp className="w-4 h-4" />;
      case "info":
        return <Clock className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const handleAcknowledge = (alertId: number, acknowledged: boolean | null) => {
    updateStatusMutation.mutate({ alertId, acknowledged: !acknowledged });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Histórico de Análises</h1>
        <p className="text-slate-400">Visualize e gerencie o histórico de alertas e análises do Gestor Comercial de IA</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-orange-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total de Alertas</p>
                  <p className="text-3xl font-bold text-white">{summary.total}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-red-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Críticos</p>
                  <p className="text-3xl font-bold text-red-400">{(summary.bySeverity as Record<string, number>)?.critical || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-amber-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avisos</p>
                  <p className="text-3xl font-bold text-amber-400">{(summary.bySeverity as Record<string, number>)?.warning || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-green-500/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Reconhecidos</p>
                  <p className="text-3xl font-bold text-green-400">{summary.acknowledged}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Alertas ao Longo do Tempo</CardTitle>
              <CardDescription>Distribuição de alertas por data</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#e2e8f0" }} />
                  <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Severity Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Distribuição por Severidade</CardTitle>
              <CardDescription>Alertas por nível de severidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Alertas por Categoria</CardTitle>
              <CardDescription>Distribuição de alertas por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#e2e8f0" }} />
                  <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Histórico de Alertas
          </CardTitle>
          <CardDescription>Filtrar e visualizar todos os alertas gerados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Período</label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Severidade</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="info">Informação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Categoria</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pipeline">Pipeline</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="opportunity">Oportunidade</SelectItem>
                  <SelectItem value="risk">Risco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Buscar</label>
              <Input placeholder="Buscar alertas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border-slate-700 text-white placeholder-slate-500" />
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {alertsLoading ? (
              <div className="text-center py-8 text-slate-400">Carregando alertas...</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-slate-400">Nenhum alerta encontrado</div>
            ) : (
              filteredAlerts.map((alert, idx) => (
                <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <div className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} space-y-2`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <p className="text-sm opacity-75">{alert.description}</p>
                          {alert.recommendation && <p className="text-sm mt-1 font-medium">💡 {alert.recommendation}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.category}
                        </Badge>
                        <span className="text-xs opacity-50">{new Date(alert.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs opacity-50">{new Date(alert.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <Button
                        size="sm"
                        variant={alert.acknowledged ? "default" : "outline"}
                        onClick={() => handleAcknowledge(alert.id, alert.acknowledged)}
                        className={alert.acknowledged ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {alert.acknowledged ? "✓ Reconhecido" : "Reconhecer"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
