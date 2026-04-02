import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-1",
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

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("Leads Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("lists leads (empty initially or with existing data)", async () => {
    const leads = await caller.leads.list();
    expect(Array.isArray(leads)).toBe(true);
  });

  it("creates a lead", async () => {
    const lead = await caller.leads.create({
      name: "Lead Teste Vitest",
      email: "vitest@test.com",
      phone: "+55 11 99999-0000",
      company: "Empresa Teste",
      source: "manual",
    });
    expect(lead).toBeDefined();
    expect(lead.id).toBeGreaterThan(0);
  });

  it("gets lead by id", async () => {
    const leads = await caller.leads.list();
    if (leads.length > 0) {
      const lead = await caller.leads.getById({ id: leads[0].id });
      expect(lead).toBeDefined();
      expect(lead?.name).toBeTruthy();
    }
  });
});

describe("Deals Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("lists deals", async () => {
    const deals = await caller.deals.list();
    expect(Array.isArray(deals)).toBe(true);
  });

  it("creates a deal", async () => {
    const leads = await caller.leads.list();
    if (leads.length > 0) {
      const deal = await caller.deals.create({
        leadId: leads[0].id,
        title: "Deal Teste Vitest",
        value: "10000",
        stage: "prospecting",
      });
      expect(deal).toBeDefined();
      expect(deal.id).toBeGreaterThan(0);
    }
  });
});

describe("Dashboard Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("returns KPIs", async () => {
    const kpis = await caller.dashboard.kpis();
    expect(kpis).toBeDefined();
    expect(typeof kpis.totalLeads).toBe("number");
    expect(typeof kpis.conversionRate).toBe("number");
  });

  it("returns pipeline data", async () => {
    const pipeline = await caller.dashboard.pipeline();
    expect(Array.isArray(pipeline)).toBe(true);
  });

  it("returns leads by status", async () => {
    const data = await caller.dashboard.leadsByStatus();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe("Automations Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("lists automations", async () => {
    const automations = await caller.automations.list();
    expect(Array.isArray(automations)).toBe(true);
  });

  it("creates an automation", async () => {
    const auto = await caller.automations.create({
      name: "Automação Vitest",
      trigger: "lead_status_change",
      action: "send_whatsapp",
    });
    expect(auto).toBeDefined();
    expect(auto.id).toBeGreaterThan(0);
  });

  it("toggles an automation", async () => {
    const automations = await caller.automations.list();
    if (automations.length > 0) {
      const result = await caller.automations.toggle({ id: automations[0].id, isActive: false });
      expect(result.success).toBe(true);
    }
  });
});

describe("Trail Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("gets progress", async () => {
    const progress = await caller.trail.getProgress();
    expect(Array.isArray(progress)).toBe(true);
  });

  it("updates progress", async () => {
    const result = await caller.trail.updateProgress({
      pillar: "anatomia",
      stepIndex: 2,
      totalSteps: 5,
      status: "in_progress",
    });
    expect(result).toBeDefined();
  });
});

describe("AGC Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("lists alerts", async () => {
    const alerts = await caller.agc.alerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it("generates alerts via AI", async () => {
    const result = await caller.agc.generate();
    expect(result).toBeDefined();
    expect(typeof result.generated).toBe("number");
  }, 30000);
});

describe("Diagnostics Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("lists diagnostics", async () => {
    const diagnostics = await caller.diagnostics.list();
    expect(Array.isArray(diagnostics)).toBe(true);
  });

  it("saves a diagnostic", async () => {
    const result = await caller.diagnostics.save({
      type: "onboarding",
      answers: { revenue: "50000", team_size: "5" },
      maturityScore: 65,
      revenueGap: "25000",
      projectedRoi: "300",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
  });
});

describe("Admin Router (requires admin role)", () => {
  const adminCaller = appRouter.createCaller(createContext("admin"));

  it("returns admin stats", async () => {
    const stats = await adminCaller.admin.stats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalCompanies).toBe("number");
    expect(typeof stats.activeCompanies).toBe("number");
  });

  it("lists companies", async () => {
    const companies = await adminCaller.admin.companies.list();
    expect(Array.isArray(companies)).toBe(true);
  });

  it("creates a company", async () => {
    const company = await adminCaller.admin.companies.create({
      name: "Empresa Vitest",
      plan: "starter",
      maxSeats: 5,
      monthlyPrice: "990",
    });
    expect(company).toBeDefined();
    expect(company.id).toBeGreaterThan(0);
  });
});

describe("WhatsApp Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("lists messages", async () => {
    const messages = await caller.whatsapp.messages();
    expect(Array.isArray(messages)).toBe(true);
  });

  it("sends a message", async () => {
    const msg = await caller.whatsapp.send({
      remoteJid: "+5511999990000",
      content: "Mensagem teste vitest",
    });
    expect(msg).toBeDefined();
    expect(msg.id).toBeGreaterThan(0);
  });
});

describe("AI Chat Router", () => {
  const caller = appRouter.createCaller(createContext());

  it("responds to a chat message", async () => {
    const result = await caller.ai.chat({
      messages: [
        { role: "system", content: "Você é um assistente comercial." },
        { role: "user", content: "Olá, teste." },
      ],
    });
    expect(result).toBeDefined();
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  }, 30000);
});
