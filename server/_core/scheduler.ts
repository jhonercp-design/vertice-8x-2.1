import * as cron from "node-cron";
import * as db from "../db";
import { invokeLLM, type Message } from "./llm";

let scheduledJobs: Map<string, any> = new Map();

/**
 * Analisa pipeline e gera alertas estratégicos automaticamente
 * Executa de hora em hora entre 7h-19h
 */
export async function analyzePipelineAutomatically(companyId: number) {
  try {
    console.log(`[Scheduler] Iniciando análise de pipeline para empresa ${companyId}`);

    // 1. Obter dados do pipeline
    const leads = await db.getLeads(companyId);
    const deals = leads.flatMap((l) => (l as any).deals || []);

    if (deals.length === 0) {
      console.log(`[Scheduler] Nenhum deal encontrado para empresa ${companyId}`);
      return;
    }

    // 2. Preparar contexto para análise
    const pipelineContext = {
      totalDeals: deals.length,
      byStage: {
        prospecting: deals.filter((d) => d.stage === "prospecting").length,
        qualification: deals.filter((d) => d.stage === "qualification").length,
        proposal: deals.filter((d) => d.stage === "proposal").length,
        negotiation: deals.filter((d) => d.stage === "negotiation").length,
        closed_won: deals.filter((d) => d.stage === "closed_won").length,
        closed_lost: deals.filter((d) => d.stage === "closed_lost").length,
      },
      totalValue: deals.reduce((sum, d) => sum + (parseFloat(d.value || "0") || 0), 0),
      avgValue: deals.reduce((sum, d) => sum + (parseFloat(d.value || "0") || 0), 0) / deals.length,
      conversionRate: (deals.filter((d) => d.stage === "closed_won").length / deals.length) * 100,
    };

    // 3. Invocar LLM para análise estratégica
    const llmMessages: Message[] = [
      {
        role: "system",
        content: `Você é um gestor comercial especialista em análise de pipeline e estratégia de vendas. 
        Analise os dados fornecidos e gere alertas estratégicos focados em:
        1) Oportunidades de aceleração de deals
        2) Riscos de perda de oportunidades
        3) Recomendações de ações imediatas
        4) Análise de conversão e performance
        5) Sugestões de otimização do pipeline
        
        Responda em JSON com estrutura: { alerts: [], recommendations: [], score: number, sentiment: string }`,
      },
      {
        role: "user",
        content: `Analise este pipeline: ${JSON.stringify(pipelineContext)}`,
      },
    ];

    const response = await invokeLLM({ messages: llmMessages });
    const analysisText = typeof response.choices?.[0]?.message?.content === "string" ? response.choices[0].message.content : "";

    let analysis = { alerts: [], recommendations: [], score: 50, sentiment: "neutral" };
    try {
      analysis = JSON.parse(analysisText);
    } catch (e) {
      console.warn("[Scheduler] Falha ao parsear resposta do LLM, usando valores padrão");
    }

    // 4. Salvar alertas no banco
    for (const alert of analysis.alerts || []) {
      const alertObj = alert as any;
      const severityMap: Record<string, "info" | "warning" | "critical"> = {
        high: "critical",
        medium: "warning",
        low: "info",
      };
      await db.createAgcAlert({
        companyId,
        category: "pipeline_analysis",
        title: alertObj.title || "Alerta de Pipeline",
        description: alertObj.description || JSON.stringify(alert),
        severity: severityMap[alertObj.severity] || "warning",
        recommendation: alertObj.recommendation || "Revisar pipeline",
        data: { source: "automated_scheduler", timestamp: new Date().toISOString() },
      });
    }

    console.log(`[Scheduler] Análise concluída para empresa ${companyId}. ${analysis.alerts?.length || 0} alertas gerados.`);
    return analysis;
  } catch (error) {
    console.error(`[Scheduler] Erro ao analisar pipeline para empresa ${companyId}:`, error);
  }
}

/**
 * Inicia o agendamento automático para uma empresa
 * Executa de hora em hora entre 7h-19h (segunda a sexta)
 */
export function startScheduler(companyId: number) {
  const jobKey = `pipeline-analysis-${companyId}`;

  // Parar job anterior se existir
  if (scheduledJobs.has(jobKey)) {
    const existingJob = scheduledJobs.get(jobKey);
    existingJob?.stop();
    scheduledJobs.delete(jobKey);
  }

  // Agendar novo job: a cada hora, de segunda a sexta, entre 7h-19h
  // Cron: "0 7-19 * * 1-5" (minuto 0, horas 7-19, qualquer dia do mês, qualquer mês, segunda-sexta)
  const job = cron.schedule("0 7-19 * * 1-5", async () => {
    console.log(`[Scheduler] Executando análise de pipeline para empresa ${companyId}`);
    await analyzePipelineAutomatically(companyId);
  });

  scheduledJobs.set(jobKey, job);
  console.log(`[Scheduler] Job agendado para empresa ${companyId}: ${jobKey}`);
}

/**
 * Para o agendamento para uma empresa
 */
export function stopScheduler(companyId: number) {
  const jobKey = `pipeline-analysis-${companyId}`;
  const job = scheduledJobs.get(jobKey);
  if (job) {
    job.stop();
    scheduledJobs.delete(jobKey);
    console.log(`[Scheduler] Job parado para empresa ${companyId}: ${jobKey}`);
  }
}

/**
 * Inicia schedulers para todas as empresas ativas
 */
export async function initializeAllSchedulers() {
  try {
    const companies = await db.getCompanies();
    const activeCompanies = companies.filter((c) => c.status === "active");

    console.log(`[Scheduler] Inicializando schedulers para ${activeCompanies.length} empresas ativas`);

    for (const company of activeCompanies) {
      startScheduler(company.id);
    }
  } catch (error) {
    console.error("[Scheduler] Erro ao inicializar schedulers:", error);
  }
}

/**
 * Para todos os schedulers
 */
export function stopAllSchedulers() {
  console.log(`[Scheduler] Parando todos os ${scheduledJobs.size} schedulers`);
  scheduledJobs.forEach((job) => {
    job.stop();
  });
  scheduledJobs.clear();
}
