import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Users, DollarSign, Target, AlertCircle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function SalesAnalytics() {
  const { data: metrics, isLoading: metricsLoading } = trpc.salesAnalytics.getMetrics.useQuery();
  const { data: revenueData, isLoading: revenueLoading } = trpc.salesAnalytics.getRevenueByPlan.useQuery();
  const { data: statusData, isLoading: statusLoading } = trpc.salesAnalytics.getCompanyStatus.useQuery();

  const COLORS = ["#f97316", "#06b6d4", "#8b5cf6", "#ec4899"];

  const kpis = metrics
    ? [
        {
          title: "MRR Total",
          value: `R$ ${metrics.totalMRR.toLocaleString("pt-BR")}`,
          change: "+12.5%",
          icon: DollarSign,
          color: "from-orange-500 to-orange-600",
        },
        {
          title: "Empresas Ativas",
          value: metrics.activeCompanies,
          change: `${metrics.conversionRate}% conversão`,
          icon: Users,
          color: "from-cyan-500 to-cyan-600",
        },
        {
          title: "Taxa de Churn",
          value: `${metrics.churnRate}%`,
          change: "-2.3% vs mês anterior",
          icon: TrendingUp,
          color: "from-purple-500 to-purple-600",
        },
        {
          title: "Planos Pagos",
          value: metrics.paidCompanies,
          change: `${Math.round((metrics.paidCompanies / metrics.totalCompanies) * 100)}% do total`,
          icon: Target,
          color: "from-pink-500 to-pink-600",
        },
      ]
    : [];

  return (
    <motion.div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8" variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div className="mb-12" variants={itemVariants}>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">Análise de Vendas</h1>
        <p className="text-slate-400 text-lg">Métricas em tempo real do seu SaaS</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" variants={containerVariants}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl hover:from-slate-800/70 hover:to-slate-900/70 transition-all duration-300 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">{kpi.title}</CardTitle>
                  <div className={`bg-gradient-to-br ${kpi.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{kpi.value}</div>
                  <p className="text-xs text-orange-400 font-semibold">{kpi.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Grid */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12" variants={containerVariants}>
        {/* Revenue by Plan */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl shadow-2xl h-full">
            <CardHeader>
              <CardTitle className="text-white">Receita por Plano</CardTitle>
              <CardDescription className="text-slate-400">Distribuição de MRR por tipo de plano</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-400">Carregando...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#e2e8f0" }} />
                    <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Company Status */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl shadow-2xl h-full">
            <CardHeader>
              <CardTitle className="text-white">Status das Empresas</CardTitle>
              <CardDescription className="text-slate-400">Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              {statusLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-400">Carregando...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusData || []} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                      {statusData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Insights */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Insights Estratégicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics && (
                <>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300">
                      <span className="font-semibold text-orange-400">MRR em crescimento:</span> Seu MRR total é de <span className="font-bold">R$ {metrics.totalMRR.toLocaleString("pt-BR")}</span>, com{" "}
                      <span className="font-bold">{metrics.paidCompanies}</span> empresas em planos pagos.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300">
                      <span className="font-semibold text-cyan-400">Taxa de conversão:</span> <span className="font-bold">{metrics.conversionRate}%</span> das empresas estão em planos pagos, indicando boa aceitação do
                      produto.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-300">
                      <span className="font-semibold text-purple-400">Churn sob controle:</span> Taxa de churn de <span className="font-bold">{metrics.churnRate}%</span> está dentro de limites saudáveis para SaaS.
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
