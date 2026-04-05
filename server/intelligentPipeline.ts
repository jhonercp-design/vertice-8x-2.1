/**
 * Intelligent Pipeline System
 * Fase 2: Automação de Follow-up
 * Fase 3: Integração WhatsApp
 * Fase 4: Análise Inteligente com IA
 */

import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// ============================================================================
// FASE 2: AUTOMAÇÃO DE FOLLOW-UP
// ============================================================================

// Tipos para automações

export interface AutomationRule {
  id: number;
  companyId: number;
  name: string;
  trigger: "stage_change" | "days_without_movement" | "value_threshold";
  triggerValue: string; // JSON stringified
  action: "send_message" | "send_email" | "create_task" | "notify";
  actionTemplate: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Trigger automations based on lead stage change
 */
export async function triggerAutomationsOnStageChange(
  leadId: number,
  oldStage: string,
  newStage: string,
  companyId: number
) {
  try {
    // Get all active automations for this company
    const automations = await getActiveAutomations(companyId);

    for (const automation of automations) {
      if (automation.trigger === "stage_change") {
        const triggerConfig = JSON.parse(automation.triggerValue);

        // Check if this automation applies to the stage change
        if (
          triggerConfig.fromStage === oldStage &&
          triggerConfig.toStage === newStage
        ) {
          // Execute the automation action
          await executeAutomationAction(automation, leadId, newStage);
        }
      }
    }
  } catch (error) {
    console.error("Error triggering automations:", error);
  }
}

/**
 * Execute automation action (send message, email, create task, etc)
 */
async function executeAutomationAction(
  automation: AutomationRule,
  leadId: number,
  newStage: string
) {
  try {
    switch (automation.action) {
      case "send_message":
        // Fase 3: Will integrate with WhatsApp
        await sendAutomatedMessage(leadId, automation.actionTemplate, newStage);
        break;

      case "send_email":
        // Send email notification
        await sendAutomatedEmail(leadId, automation.actionTemplate);
        break;

      case "create_task":
        // Create follow-up task
        await createFollowUpTask(leadId, automation.actionTemplate);
        break;

      case "notify":
        // Notify team members
        await notifyTeam(leadId, automation.actionTemplate);
        break;
    }
  } catch (error) {
    console.error("Error executing automation action:", error);
  }
}

async function getActiveAutomations(companyId: number): Promise<AutomationRule[]> {
  // TODO: Query from database
  // Example: const automations = await db.select().from(automations).where(eq(automations.companyId, companyId));
  return [];
}

async function sendAutomatedMessage(
  leadId: number,
  template: string,
  stage: string
) {
  console.log(`[Automation] Sending message to lead ${leadId}: ${template}`);
  // Fase 3: Will integrate with WhatsApp here
}

async function sendAutomatedEmail(leadId: number, template: string) {
  console.log(`[Automation] Sending email to lead ${leadId}: ${template}`);
}

async function createFollowUpTask(leadId: number, description: string) {
  console.log(`[Automation] Creating follow-up task for lead ${leadId}: ${description}`);
}

async function notifyTeam(leadId: number, message: string) {
  console.log(`[Automation] Notifying team about lead ${leadId}: ${message}`);
}

// ============================================================================
// FASE 3: INTEGRAÇÃO WHATSAPP
// ============================================================================

export interface WhatsAppMessage {
  id: number;
  leadId: number;
  companyId: number;
  phoneNumber: string;
  message: string;
  type: "outbound" | "inbound";
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

/**
 * Send WhatsApp message when lead changes stage
 */
export async function sendWhatsAppOnStageChange(
  leadId: number,
  newStage: string,
  leadPhone: string,
  companyId: number
) {
  try {
    // Get template for this stage
    const template = getWhatsAppTemplateForStage(newStage);

    if (template) {
      // Send WhatsApp message
      await sendWhatsAppMessage(leadId, leadPhone, template, companyId);
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

/**
 * Get WhatsApp template based on stage
 */
function getWhatsAppTemplateForStage(stage: string): string | null {
  const templates: Record<string, string> = {
    new: "Olá! 👋 Obrigado por seu interesse. Estamos analisando sua solicitação.",
    contacted:
      "Ótimo! Entramos em contato. Qual é o melhor horário para conversar?",
    qualified:
      "Excelente! Você se qualificou para nossa proposta. Vamos agendar uma reunião?",
    proposal:
      "Sua proposta está pronta! 🎉 Confira os detalhes e nos diga o que acha.",
    negotiation:
      "Vamos finalizar os detalhes! Qual é sua melhor disponibilidade?",
    won: "Parabéns! 🎊 Você é nosso novo cliente! Bem-vindo à nossa família.",
    lost: "Entendemos sua decisão. Ficamos à disposição para o futuro!",
  };

  return templates[stage] || null;
}

/**
 * Send WhatsApp message via API
 */
async function sendWhatsAppMessage(
  leadId: number,
  phoneNumber: string,
  message: string,
  companyId: number
) {
  try {
    // TODO: Integrate with WhatsApp Business API or Baileys
    console.log(
      `[WhatsApp] Sending to ${phoneNumber}: ${message}`
    );

    // Log message in database
    // await db.insert(whatsappMessages).values({
    //   leadId,
    //   companyId,
    //   phoneNumber,
    //   message,
    //   type: "outbound",
    //   status: "sent",
    // });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

// ============================================================================
// FASE 4: ANÁLISE INTELIGENTE COM IA
// ============================================================================

export interface PipelineAnalysis {
  id: number;
  leadId: number;
  companyId: number;
  oldStage: string;
  newStage: string;
  analysis: string; // AI-generated analysis
  recommendations: string[]; // Suggested next actions
  sentiment: "positive" | "neutral" | "negative";
  confidence: number; // 0-100
  createdAt: Date;
}

/**
 * Analyze lead stage change with AI
 */
export async function analyzeStageChangeWithAI(
  leadId: number,
  leadName: string,
  leadValue: number,
  oldStage: string,
  newStage: string,
  companyId: number
): Promise<PipelineAnalysis | null> {
  try {
    // Prepare context for AI analysis
    const context = `
Lead: ${leadName}
Value: $${leadValue}
Previous Stage: ${oldStage}
New Stage: ${newStage}
Movement: ${oldStage} → ${newStage}

Analyze this lead movement and provide:
1. What this movement means for the sales process
2. Why this movement might have happened
3. 3-5 recommended next actions
4. Sentiment (positive/neutral/negative)
5. Confidence level (0-100)

Be concise and actionable.
    `;

    // Call LLM for analysis
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a sales expert analyzing lead movements in a CRM pipeline. Provide strategic insights and recommendations.",
        },
        {
          role: "user",
          content: context,
        },
      ],
    });

    const messageContent = response.choices[0]?.message?.content;
    const analysisText = typeof messageContent === 'string' ? messageContent : "Unable to analyze";

    // Parse AI response to extract structured data
    const analysis = parseAIAnalysis(analysisText);

    // Store analysis in database
    // await db.insert(pipelineAnalyses).values({
    //   leadId,
    //   companyId,
    //   oldStage,
    //   newStage,
    //   analysis: analysisText,
    //   recommendations: analysis.recommendations,
    //   sentiment: analysis.sentiment,
    //   confidence: analysis.confidence,
    // });

    return {
      id: 0,
      leadId,
      companyId,
      oldStage,
      newStage,
      analysis: analysisText,
      recommendations: analysis.recommendations,
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error analyzing stage change with AI:", error);
    return null;
  }
}

/**
 * Parse AI analysis response
 */
function parseAIAnalysis(
  analysisText: string
): {
  recommendations: string[];
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
} {
  // Simple parsing - can be enhanced
  const recommendations: string[] = [];
  const lines = (analysisText || "").split("\n");

  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      recommendations.push(line.replace(/^\d+\.\s*/, "").trim());
    }
  }

  // Determine sentiment
  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  const text = analysisText.toLowerCase();

  if (
    text.includes("excellent") ||
    text.includes("great") ||
    text.includes("positive")
  ) {
    sentiment = "positive";
  } else if (
    text.includes("concern") ||
    text.includes("risk") ||
    text.includes("negative")
  ) {
    sentiment = "negative";
  }

  // Extract confidence (look for percentage)
  const confidenceMatch = analysisText.match(/(\d+)%/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

  return {
    recommendations: recommendations.slice(0, 5),
    sentiment,
    confidence,
  };
}

/**
 * Generate strategic recommendations based on pipeline analysis
 */
export async function generateStrategicRecommendations(
  companyId: number,
  pipelineData: any
): Promise<string[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a sales strategy expert. Analyze pipeline data and provide 3-5 strategic recommendations to improve conversion.",
        },
        {
          role: "user",
          content: `Pipeline Data: ${JSON.stringify(pipelineData)}`,
        },
      ],
    }) as any;

    const recommendations: string[] = [];
    const messageContent = response.choices[0]?.message?.content;
    const text = typeof messageContent === 'string' ? messageContent : "";
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        recommendations.push(line.replace(/^\d+\.\s*/, "").trim());
      }
    }

    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return [];
  }
}

// All functions are already exported above
