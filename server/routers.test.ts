import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "user" | "admin" = "user", openId = "test-user-1"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId,
    email: "test@vertice.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("Leads Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists leads", async () => { const leads = await caller.leads.list(); expect(Array.isArray(leads)).toBe(true); });
  it("creates a lead", async () => { const lead = await caller.leads.create({ name: "Lead Vitest", email: "v@test.com", phone: "+5511999990000", source: "manual" }); expect(lead.id).toBeGreaterThan(0); });
  it("gets lead by id", async () => { const leads = await caller.leads.list(); if (leads.length > 0) { const lead = await caller.leads.getById({ id: leads[0].id }); expect(lead?.name).toBeTruthy(); } });
});

describe("Deals Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists deals", async () => { const deals = await caller.deals.list(); expect(Array.isArray(deals)).toBe(true); });
  it("creates a deal", async () => { const deal = await caller.deals.create({ title: "Deal Vitest", value: "10000", stage: "prospecting" }); expect(deal.id).toBeGreaterThan(0); });
});

describe("Dashboard Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("returns KPIs", async () => { const kpis = await caller.dashboard.kpis(); expect(typeof kpis.totalLeads).toBe("number"); expect(typeof kpis.conversionRate).toBe("number"); });
  it("returns pipeline", async () => { const pipeline = await caller.dashboard.pipeline(); expect(Array.isArray(pipeline)).toBe(true); });
  it("returns leads by status", async () => { const data = await caller.dashboard.leadsByStatus(); expect(Array.isArray(data)).toBe(true); });
});

describe("Goals Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists goals", async () => { const goals = await caller.goals.list(); expect(Array.isArray(goals)).toBe(true); });
  it("creates a goal", async () => { const goal = await caller.goals.create({ label: "Receita Mensal", target: "100000", unit: "R$", period: "monthly" }); expect(goal.id).toBeGreaterThan(0); });
  it("updates a goal", async () => { const goals = await caller.goals.list(); if (goals.length > 0) { const result = await caller.goals.update({ id: goals[0].id, current: "50000" }); expect(result.success).toBe(true); } });
});

describe("KPIs Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists KPIs", async () => { const kpis = await caller.kpis.list(); expect(Array.isArray(kpis)).toBe(true); });
  it("creates a KPI", async () => { const kpi = await caller.kpis.create({ label: "Ticket Médio", value: "5000", category: "Vendas", unit: "R$" }); expect(kpi.id).toBeGreaterThan(0); });
});

describe("Products Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists products", async () => { const products = await caller.products.list(); expect(Array.isArray(products)).toBe(true); });
  it("creates a product", async () => { const p = await caller.products.create({ name: "Consultoria Vértice", price: "15000", category: "Consultoria" }); expect(p.id).toBeGreaterThan(0); });
});

describe("Projects Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists projects", async () => { const projects = await caller.projects.list(); expect(Array.isArray(projects)).toBe(true); });
  it("creates a project", async () => { const p = await caller.projects.create({ name: "Projeto Vitest", client: "Cliente X", budget: "50000" }); expect(p.id).toBeGreaterThan(0); });
  it("updates project status", async () => { const projects = await caller.projects.list(); if (projects.length > 0) { const result = await caller.projects.update({ id: projects[0].id, status: "execution" }); expect(result.success).toBe(true); } });
});

describe("Playbooks Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists playbooks", async () => { const playbooks = await caller.playbooks.list(); expect(Array.isArray(playbooks)).toBe(true); });
  it("creates a playbook", async () => { const p = await caller.playbooks.create({ name: "SPIN Selling", framework: "SPIN", steps: 4 }); expect(p.id).toBeGreaterThan(0); });
});

describe("Proposals Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists proposals", async () => { const proposals = await caller.proposals.list(); expect(Array.isArray(proposals)).toBe(true); });
  it("creates a proposal", async () => { const p = await caller.proposals.create({ title: "Proposta Vitest", value: "25000" }); expect(p.id).toBeGreaterThan(0); });
  it("updates proposal status", async () => { const proposals = await caller.proposals.list(); if (proposals.length > 0) { const result = await caller.proposals.update({ id: proposals[0].id, status: "sent" }); expect(result.success).toBe(true); } });
});

describe("Gamification Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists scores", async () => { const scores = await caller.gamification.scores(); expect(Array.isArray(scores)).toBe(true); });
});

describe("Automations Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists automations", async () => { const automations = await caller.automations.list(); expect(Array.isArray(automations)).toBe(true); });
  it("creates an automation", async () => { const a = await caller.automations.create({ name: "Auto Vitest", trigger: "lead_status_change", action: "send_whatsapp" }); expect(a.id).toBeGreaterThan(0); });
});

describe("Trail Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("gets progress", async () => { const progress = await caller.trail.getProgress(); expect(Array.isArray(progress)).toBe(true); });
  it("updates progress", async () => { const result = await caller.trail.updateProgress({ pillar: "anatomia", stepIndex: 2, totalSteps: 5, status: "in_progress" }); expect(result).toBeDefined(); });
});

describe("AGC Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists alerts", async () => { const alerts = await caller.agc.alerts(); expect(Array.isArray(alerts)).toBe(true); });
  it("generates alerts via AI", async () => { const result = await caller.agc.generate(); expect(typeof result.generated).toBe("number"); }, 30000);
});

describe("Diagnostics Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists diagnostics", async () => { const d = await caller.diagnostics.list(); expect(Array.isArray(d)).toBe(true); });
  it("saves a diagnostic", async () => { const d = await caller.diagnostics.save({ type: "onboarding", answers: { revenue: "50000" }, maturityScore: 65, revenueGap: "25000", projectedRoi: "300" }); expect(d.id).toBeGreaterThan(0); });
});

describe("Admin Router (founder-only)", () => {
  const adminCaller = appRouter.createCaller(createContext("admin", process.env.OWNER_OPEN_ID || "9cbiqa7EkPLSfYdpFeBdor"));
  it("returns admin stats", async () => { const stats = await adminCaller.admin.stats(); expect(typeof stats.totalCompanies).toBe("number"); });
  it("lists companies", async () => { const companies = await adminCaller.admin.companies.list(); expect(Array.isArray(companies)).toBe(true); });
  it("creates a company", async () => { const c = await adminCaller.admin.companies.create({ name: "Empresa Vitest", plan: "starter", maxSeats: 5, monthlyPrice: "990" }); expect(c.id).toBeGreaterThan(0); });
});

describe("WhatsApp Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("lists messages", async () => { const msgs = await caller.whatsapp.messages(); expect(Array.isArray(msgs)).toBe(true); });
  it("sends a message", async () => { const msg = await caller.whatsapp.send({ remoteJid: "+5511999990000", content: "Teste vitest" }); expect(msg.id).toBeGreaterThan(0); });
});

describe("AI Chat Router", () => {
  const caller = appRouter.createCaller(createContext());
  it("responds to a chat message", async () => {
    const result = await caller.ai.chat({ messages: [{ role: "system", content: "Assistente." }, { role: "user", content: "Olá" }] });
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  }, 30000);
});
