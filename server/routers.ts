import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { invokeLLM, type Message } from "./_core/llm";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== AI =====
  ai: router({
    chat: protectedProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string() })) }))
      .mutation(async ({ input }) => {
        const llmMessages: Message[] = input.messages.map((m) => ({ role: m.role as "system" | "user" | "assistant", content: m.content }));
        const response = await invokeLLM({ messages: llmMessages });
        const rawContent = response.choices?.[0]?.message?.content;
        return { content: typeof rawContent === "string" ? rawContent : "Desculpe, não consegui processar sua mensagem." };
      }),
  }),

  // ===== LEADS =====
  leads: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.getLeads(companyId, input?.search);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getLeadById(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional(),
        source: z.string().optional(),
        value: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        const result = await db.createLead({ ...input, companyId, assignedTo: ctx.user.id });
        await db.createActivity({ companyId, leadId: result.id, userId: ctx.user.id, type: "status_change", title: "Lead criado", description: `Lead ${input.name} adicionado ao CRM.` });
        return result;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
        value: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateLead(id, data);
        if (input.status) {
          const companyId = ctx.user.companyId || 1;
          await db.createActivity({ companyId, leadId: id, userId: ctx.user.id, type: "status_change", title: `Status alterado para ${input.status}`, description: `Status do lead atualizado.` });
        }
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await db.deleteLead(input.id); return { success: true }; }),
  }),

  // ===== DEALS =====
  deals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getDeals(companyId);
    }),
    getByLead: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => db.getDealsByLead(input.leadId)),
    create: protectedProcedure
      .input(z.object({
        leadId: z.number().optional(),
        title: z.string().min(1),
        value: z.string().optional(),
        stage: z.enum(["prospecting", "qualification", "proposal", "negotiation", "closing", "won", "lost"]).optional(),
        probability: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.createDeal({ ...input, companyId, assignedTo: ctx.user.id });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        value: z.string().optional(),
        stage: z.enum(["prospecting", "qualification", "proposal", "negotiation", "closing", "won", "lost"]).optional(),
        probability: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await db.updateDeal(id, data); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await db.deleteDeal(input.id); return { success: true }; }),
  }),

  // ===== ACTIVITIES =====
  activities: router({
    getByLead: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => db.getActivitiesByLead(input.leadId)),
    create: protectedProcedure
      .input(z.object({
        leadId: z.number().optional(),
        dealId: z.number().optional(),
        type: z.enum(["note", "call", "email", "meeting", "whatsapp", "proposal", "diagnostic", "agc_alert", "task", "status_change"]),
        title: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.createActivity({ ...input, companyId, userId: ctx.user.id });
      }),
  }),

  // ===== DASHBOARD =====
  dashboard: router({
    kpis: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getDashboardKpis(companyId);
    }),
    pipeline: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getPipelineSummary(companyId);
    }),
    leadsByStatus: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getLeadsByStatus(companyId);
    }),
  }),

  // ===== TRAIL =====
  trail: router({
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getTrailProgress(companyId, ctx.user.id);
    }),
    updateProgress: protectedProcedure
      .input(z.object({ pillar: z.string(), stepIndex: z.number(), totalSteps: z.number(), status: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        await db.upsertTrailProgress(companyId, ctx.user.id, input.pillar, input.stepIndex, input.totalSteps, input.status);
        return { success: true };
      }),
  }),

  // ===== AGC =====
  agc: router({
    alerts: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getAgcAlerts(companyId);
    }),
    acknowledge: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => { await db.acknowledgeAlert(input.id, ctx.user.id); return { success: true }; }),
    generate: protectedProcedure.mutation(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      const kpis = await db.getDashboardKpis(companyId);
      const leadsData = await db.getLeads(companyId);
      const prompt = `Você é o AGC (Agente de Governança Comercial) da Vértice. Analise os dados e gere alertas estratégicos.
Dados: ${JSON.stringify({ kpis, totalLeads: leadsData.length })}
Gere 1-3 alertas em JSON: [{"severity":"info|warning|critical","category":"string","title":"string","description":"string","recommendation":"string"}]`;
      const response = await invokeLLM({ messages: [{ role: "system", content: "Responda apenas com JSON válido." }, { role: "user", content: prompt }] });
      const raw = typeof response.choices?.[0]?.message?.content === "string" ? response.choices[0].message.content : "[]";
      try {
        const alerts = JSON.parse(raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
        for (const alert of alerts) {
          await db.createAgcAlert({ companyId, ...alert });
        }
        return { generated: alerts.length };
      } catch { return { generated: 0 }; }
    }),
  }),

  // ===== AUTOMATIONS =====
  automations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getAutomations(companyId);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        trigger: z.enum(["lead_status_change", "deal_stage_change", "agc_alert", "scheduled", "manual"]),
        triggerConfig: z.any().optional(),
        action: z.enum(["send_whatsapp", "create_task", "send_email", "notify_team", "update_lead"]),
        actionConfig: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.createAutomation({ ...input, companyId });
      }),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => { await db.toggleAutomation(input.id, input.isActive); return { success: true }; }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await db.deleteAutomation(input.id); return { success: true }; }),
  }),

  // ===== ONBOARDING / DIAGNOSTICS =====
  diagnostics: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const companyId = ctx.user.companyId || 1;
      return db.getDiagnostics(companyId);
    }),
    save: protectedProcedure
      .input(z.object({
        type: z.string(),
        answers: z.any(),
        maturityScore: z.number(),
        revenueGap: z.string(),
        projectedRoi: z.string(),
        analysis: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.saveDiagnostic({ ...input, companyId, userId: ctx.user.id });
      }),
  }),

  // ===== ADMIN (SaaS Control) =====
  admin: router({
    stats: adminProcedure.query(async () => db.getAdminStats()),
    companies: router({
      list: adminProcedure.query(async () => db.getCompanies()),
      getById: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => db.getCompanyById(input.id)),
      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          cnpj: z.string().optional(),
          segment: z.string().optional(),
          website: z.string().optional(),
          plan: z.enum(["trial", "starter", "professional", "enterprise"]).optional(),
          maxSeats: z.number().optional(),
          monthlyPrice: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { monthlyPrice, ...companyData } = input;
          const result = await db.createCompany(companyData);
          if (monthlyPrice && input.plan) {
            await db.createLicense({ companyId: result.id, plan: input.plan, monthlyPrice });
          }
          return result;
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          cnpj: z.string().optional(),
          segment: z.string().optional(),
          website: z.string().optional(),
          plan: z.enum(["trial", "starter", "professional", "enterprise"]).optional(),
          maxSeats: z.number().optional(),
          status: z.enum(["active", "suspended", "cancelled"]).optional(),
        }))
        .mutation(async ({ input }) => { const { id, ...data } = input; await db.updateCompany(id, data); return { success: true }; }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => { await db.deleteCompany(input.id); return { success: true }; }),
    }),
    licenses: router({
      getByCompany: adminProcedure
        .input(z.object({ companyId: z.number() }))
        .query(async ({ input }) => db.getLicensesByCompany(input.companyId)),
      create: adminProcedure
        .input(z.object({ companyId: z.number(), plan: z.enum(["trial", "starter", "professional", "enterprise"]), monthlyPrice: z.string() }))
        .mutation(async ({ input }) => db.createLicense(input)),
    }),
  }),

  // ===== WHATSAPP MESSAGES =====
  whatsapp: router({
    messages: protectedProcedure
      .input(z.object({ leadId: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.getWhatsappMessages(companyId, input?.leadId);
      }),
    send: protectedProcedure
      .input(z.object({ leadId: z.number().optional(), remoteJid: z.string(), content: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const companyId = ctx.user.companyId || 1;
        return db.createWhatsappMessage({ companyId, sessionId: 1, leadId: input.leadId, remoteJid: input.remoteJid, fromMe: true, content: input.content });
      }),
  }),
});

export type AppRouter = typeof appRouter;
