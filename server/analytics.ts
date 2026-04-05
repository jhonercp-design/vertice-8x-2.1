/**
 * Pipeline Analytics
 * Métricas de desempenho e eficácia de automações
 */

/**
 * Analytics module - uses mock data for demonstration
 * In production, connect to actual database queries
 */

export interface PipelineMetrics {
  totalLeads: number;
  leadsByStage: Record<string, number>;
  conversionRate: number;
  averageTimeInPipeline: number;
  totalValue: number;
  averageValue: number;
  stageConversionRates: Record<string, number>;
  topPerformingStage: string;
  bottleneckStage: string;
}

export interface AutomationMetrics {
  totalAutomations: number;
  automationsTriggered: number;
  automationSuccessRate: number;
  messagesDelivered: number;
  messagesOpened: number;
  followUpConversionRate: number;
}

export interface DashboardMetrics {
  pipeline: PipelineMetrics;
  automations: AutomationMetrics;
  timeRange: {
    from: Date;
    to: Date;
  };
}

/**
 * Calcular métricas do pipeline
 */
export async function calculatePipelineMetrics(
  companyId: number,
  dateFrom?: Date,
  dateTo?: Date
): Promise<PipelineMetrics> {
  try {
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 dias atrás
    const to = dateTo || new Date();

    // Mock data - in production, query from database
    const allLeads = [
      { id: 1, status: "new", value: 5000, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, status: "contacted", value: 7500, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, status: "qualified", value: 10000, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, status: "proposal", value: 15000, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, status: "negotiation", value: 20000, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, status: "won", value: 25000, createdAt: new Date(), updatedAt: new Date() },
      { id: 7, status: "lost", value: 5000, createdAt: new Date(), updatedAt: new Date() },
    ] as any;

    // Count leads by stage
    const leadsByStage: Record<string, number> = {};
    let totalValue = 0;
    let wonLeads = 0;

    for (const lead of allLeads) {
      const stage = lead.status || "new";
      leadsByStage[stage] = (leadsByStage[stage] || 0) + 1;
      totalValue += lead.value || 0;

      if (stage === "won") {
        wonLeads++;
      }
    }

    // Calculate conversion rate
    const conversionRate =
      allLeads.length > 0 ? (wonLeads / allLeads.length) * 100 : 0;

    // Calculate average time in pipeline
    let totalTime = 0;
    let completedLeads = 0;

    for (const lead of allLeads) {
      if (lead.status === "won" || lead.status === "lost") {
        const timeInPipeline =
          ((lead.updatedAt as Date)?.getTime() || 0) -
          ((lead.createdAt as Date)?.getTime() || 0);
        totalTime += timeInPipeline;
        completedLeads++;
      }
    }

    const averageTimeInPipeline =
      completedLeads > 0 ? totalTime / completedLeads / (1000 * 60 * 60 * 24) : 0; // em dias

    // Calculate stage conversion rates
    const stageConversionRates: Record<string, number> = {};
    const stages = ["new", "contacted", "qualified", "proposal", "negotiation"];

    for (const stage of stages) {
      const leadsInStage = leadsByStage[stage] || 0;
      const leadsMovedForward = allLeads.filter(
        (l: any) => l.status === stage && l.updatedAt
      ).length;

      stageConversionRates[stage] =
        leadsInStage > 0 ? (leadsMovedForward / leadsInStage) * 100 : 0;
    }

    // Find top performing and bottleneck stages
    let topPerformingStage = "new";
    let bottleneckStage = "new";
    let maxRate = -1;
    let minRate = 101;

    for (const [stage, rate] of Object.entries(stageConversionRates)) {
      if (rate > maxRate) {
        maxRate = rate;
        topPerformingStage = stage;
      }
      if (rate < minRate && rate > 0) {
        minRate = rate;
        bottleneckStage = stage;
      }
    }

    return {
      totalLeads: allLeads.length,
      leadsByStage,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageTimeInPipeline: Math.round(averageTimeInPipeline * 10) / 10,
      totalValue,
      averageValue: allLeads.length > 0 ? totalValue / allLeads.length : 0,
      stageConversionRates,
      topPerformingStage,
      bottleneckStage,
    };
  } catch (error) {
    console.error("Error calculating pipeline metrics:", error);
    return {
      totalLeads: 0,
      leadsByStage: {},
      conversionRate: 0,
      averageTimeInPipeline: 0,
      totalValue: 0,
      averageValue: 0,
      stageConversionRates: {},
      topPerformingStage: "new",
      bottleneckStage: "new",
    };
  }
}

/**
 * Calcular métricas de automações
 */
export async function calculateAutomationMetrics(
  companyId: number,
  dateFrom?: Date,
  dateTo?: Date
): Promise<AutomationMetrics> {
  try {
    const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = dateTo || new Date();

    // TODO: Query automation metrics from database
    // For now, return mock data
    return {
      totalAutomations: 5,
      automationsTriggered: 127,
      automationSuccessRate: 94.5,
      messagesDelivered: 127,
      messagesOpened: 89,
      followUpConversionRate: 23.6,
    };
  } catch (error) {
    console.error("Error calculating automation metrics:", error);
    return {
      totalAutomations: 0,
      automationsTriggered: 0,
      automationSuccessRate: 0,
      messagesDelivered: 0,
      messagesOpened: 0,
      followUpConversionRate: 0,
    };
  }
}

/**
 * Get funnel data for visualization
 */
export async function getFunnelData(
  companyId: number,
  dateFrom?: Date,
  dateTo?: Date
): Promise<Array<{ stage: string; count: number; percentage: number }>> {
  try {
    const metrics = await calculatePipelineMetrics(companyId, dateFrom, dateTo);
    const totalLeads = metrics.totalLeads;

    const stages = [
      "new",
      "contacted",
      "qualified",
      "proposal",
      "negotiation",
      "won",
    ];
    const funnelData = [];

    for (const stage of stages) {
      const count = metrics.leadsByStage[stage] || 0;
      const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;

      funnelData.push({
        stage,
        count,
        percentage: Math.round(percentage * 10) / 10,
      });
    }

    return funnelData;
  } catch (error) {
    console.error("Error getting funnel data:", error);
    return [];
  }
}

/**
 * Get time series data for trend visualization
 */
export async function getTimeSeriesData(
  companyId: number,
  days: number = 30
): Promise<
  Array<{
    date: string;
    newLeads: number;
    wonLeads: number;
    lostLeads: number;
  }>
> {
  try {
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Generate mock trend data
      const newLeads = Math.floor(Math.random() * 10) + 2;
      const wonLeads = Math.floor(Math.random() * 5) + 1;
      const lostLeads = Math.floor(Math.random() * 3);

      data.push({
        date: date.toISOString().split("T")[0],
        newLeads,
        wonLeads,
        lostLeads,
      });
    }

    return data;
  } catch (error) {
    console.error("Error getting time series data:", error);
    return [];
  }
}

/**
 * Get complete dashboard metrics
 */
export async function getDashboardMetrics(
  companyId: number,
  dateFrom?: Date,
  dateTo?: Date
): Promise<DashboardMetrics> {
  const from = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = dateTo || new Date();

  const [pipelineMetrics, automationMetrics] = await Promise.all([
    calculatePipelineMetrics(companyId, from, to),
    calculateAutomationMetrics(companyId, from, to),
  ]);

  return {
    pipeline: pipelineMetrics,
    automations: automationMetrics,
    timeRange: {
      from,
      to,
    },
  };
}
