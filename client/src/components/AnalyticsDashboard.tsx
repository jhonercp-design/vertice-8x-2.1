import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface KPIData {
  totalLeads: number;
  conversionRate: number;
  averageTimeInPipeline: number;
  totalValue: number;
  automationSuccessRate: number;
  messagesDelivered: number;
}

interface ChartData {
  funnelData: Array<{ stage: string; count: number; percentage: number }>;
  timeSeriesData: Array<{
    date: string;
    newLeads: number;
    wonLeads: number;
    lostLeads: number;
  }>;
}

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Mock data - in production, fetch from API
  const kpiData: KPIData = {
    totalLeads: 127,
    conversionRate: 23.6,
    averageTimeInPipeline: 18.5,
    totalValue: 425000,
    automationSuccessRate: 94.5,
    messagesDelivered: 127,
  };

  const chartData: ChartData = {
    funnelData: [
      { stage: "Novo", count: 45, percentage: 35.4 },
      { stage: "Contato", count: 32, percentage: 25.2 },
      { stage: "Qualificado", count: 24, percentage: 18.9 },
      { stage: "Proposta", count: 16, percentage: 12.6 },
      { stage: "Negociação", count: 8, percentage: 6.3 },
      { stage: "Ganho", count: 2, percentage: 1.6 },
    ],
    timeSeriesData: [
      { date: "01/04", newLeads: 8, wonLeads: 2, lostLeads: 1 },
      { date: "02/04", newLeads: 12, wonLeads: 3, lostLeads: 2 },
      { date: "03/04", newLeads: 6, wonLeads: 1, lostLeads: 0 },
      { date: "04/04", newLeads: 15, wonLeads: 4, lostLeads: 2 },
      { date: "05/04", newLeads: 10, wonLeads: 2, lostLeads: 1 },
    ],
  };

  const KPICard = ({
    icon: Icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    color: string;
  }) => (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {value}
              {unit && <span className="text-sm ml-1">{unit}</span>}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>{Icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Análise de Pipeline
          </h1>
          <p className="text-gray-600 mt-1">
            Métricas de desempenho e eficácia de automações
          </p>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "90d"] as const).map((range) => (
            <Button
              key={range}
              variant={dateRange === range ? "default" : "outline"}
              onClick={() => setDateRange(range)}
              className="text-sm"
            >
              {range === "7d" ? "7 dias" : range === "30d" ? "30 dias" : "90 dias"}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard
          icon={<Target className="w-6 h-6 text-blue-600" />}
          label="Total de Leads"
          value={kpiData.totalLeads}
          color="text-blue-600"
        />
        <KPICard
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          label="Taxa de Conversão"
          value={kpiData.conversionRate}
          unit="%"
          color="text-green-600"
        />
        <KPICard
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          label="Tempo Médio no Pipeline"
          value={kpiData.averageTimeInPipeline}
          unit="dias"
          color="text-orange-600"
        />
        <KPICard
          icon={<DollarSign className="w-6 h-6 text-purple-600" />}
          label="Valor Total"
          value={`R$ ${(kpiData.totalValue / 1000).toFixed(0)}k`}
          color="text-purple-600"
        />
        <KPICard
          icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
          label="Taxa de Sucesso (Automações)"
          value={kpiData.automationSuccessRate}
          unit="%"
          color="text-emerald-600"
        />
        <KPICard
          icon={<AlertCircle className="w-6 h-6 text-red-600" />}
          label="Mensagens Entregues"
          value={kpiData.messagesDelivered}
          color="text-red-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#4ECDC4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Stage Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição por Estágio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.funnelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, percentage }) =>
                    `${stage} ${percentage}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.funnelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Tendência de Leads (Últimos 5 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="newLeads"
                stroke="#4ECDC4"
                name="Novos Leads"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="wonLeads"
                stroke="#45B7D1"
                name="Leads Ganhos"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="lostLeads"
                stroke="#FF6B6B"
                name="Leads Perdidos"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Automation Metrics */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Métricas de Automação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Taxa de Sucesso</p>
              <p className="text-3xl font-bold text-green-600">94.5%</p>
              <p className="text-xs text-gray-500 mt-2">127 automações acionadas</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Mensagens Entregues</p>
              <p className="text-3xl font-bold text-blue-600">127</p>
              <p className="text-xs text-gray-500 mt-2">89 aberturas (70%)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Taxa de Conversão Follow-up</p>
              <p className="text-3xl font-bold text-purple-600">23.6%</p>
              <p className="text-xs text-gray-500 mt-2">30 conversões</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;
