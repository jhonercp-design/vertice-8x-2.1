import { eq, desc, and, sql, count, sum, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  companies, type InsertCompany,
  licenses,
  leads, type InsertLead,
  deals, type InsertDeal,
  activities, type InsertActivity,
  whatsappMessages,
  trailProgress,
  agcAlerts,
  aiConversations,
  automations,
  diagnostics,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USERS =====
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== LEADS =====
export async function createLead(data: Omit<InsertLead, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(leads).values(data);
  return { id: result[0].insertId };
}

export async function getLeads(companyId: number, search?: string) {
  const db = await getDb(); if (!db) return [];
  let query = db.select().from(leads).where(eq(leads.companyId, companyId));
  if (search) {
    query = db.select().from(leads).where(
      and(eq(leads.companyId, companyId), or(like(leads.name, `%${search}%`), like(leads.company, `%${search}%`)))
    );
  }
  return query.orderBy(desc(leads.updatedAt));
}

export async function getLeadById(id: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0] || null;
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(leads).where(eq(leads.id, id));
}

// ===== DEALS =====
export async function createDeal(data: Omit<InsertDeal, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(deals).values(data);
  return { id: result[0].insertId };
}

export async function getDeals(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(deals).where(eq(deals.companyId, companyId)).orderBy(desc(deals.updatedAt));
}

export async function getDealsByLead(leadId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(deals).where(eq(deals.leadId, leadId)).orderBy(desc(deals.updatedAt));
}

export async function updateDeal(id: number, data: Partial<InsertDeal>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(deals).set(data).where(eq(deals.id, id));
}

export async function deleteDeal(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(deals).where(eq(deals.id, id));
}

// ===== ACTIVITIES =====
export async function createActivity(data: Omit<InsertActivity, "id" | "createdAt">) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(activities).values(data);
  return { id: result[0].insertId };
}

export async function getActivitiesByLead(leadId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(activities).where(eq(activities.leadId, leadId)).orderBy(desc(activities.createdAt));
}

// ===== COMPANIES (Admin) =====
export async function createCompany(data: Omit<InsertCompany, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(companies).values(data);
  return { id: result[0].insertId };
}

export async function getCompanies() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export async function getCompanyById(id: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0] || null;
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(companies).set(data).where(eq(companies.id, id));
}

export async function deleteCompany(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(companies).where(eq(companies.id, id));
}

export async function getAdminStats() {
  const db = await getDb(); if (!db) return { totalCompanies: 0, activeCompanies: 0, totalUsers: 0, totalMrr: "0" };
  const [companyStats] = await db.select({
    totalCompanies: count(),
    activeCompanies: sum(sql`CASE WHEN ${companies.status} = 'active' THEN 1 ELSE 0 END`),
  }).from(companies);
  const [userStats] = await db.select({ totalUsers: count() }).from(users);
  const [licenseStats] = await db.select({
    totalMrr: sum(licenses.monthlyPrice),
  }).from(licenses).where(eq(licenses.status, "active"));
  return {
    totalCompanies: companyStats?.totalCompanies || 0,
    activeCompanies: Number(companyStats?.activeCompanies) || 0,
    totalUsers: userStats?.totalUsers || 0,
    totalMrr: licenseStats?.totalMrr || "0",
  };
}

// ===== DASHBOARD KPIs =====
export async function getDashboardKpis(companyId: number) {
  const db = await getDb(); if (!db) return { totalLeads: 0, totalRevenue: "0", conversionRate: 0, pipelineValue: "0" };
  const [leadStats] = await db.select({
    totalLeads: count(),
    wonLeads: sum(sql`CASE WHEN ${leads.status} = 'won' THEN 1 ELSE 0 END`),
  }).from(leads).where(eq(leads.companyId, companyId));
  const [dealStats] = await db.select({
    pipelineValue: sum(deals.value),
    wonValue: sum(sql`CASE WHEN ${deals.stage} = 'won' THEN ${deals.value} ELSE 0 END`),
  }).from(deals).where(eq(deals.companyId, companyId));
  const total = leadStats?.totalLeads || 0;
  const won = Number(leadStats?.wonLeads) || 0;
  return {
    totalLeads: total,
    totalRevenue: dealStats?.wonValue || "0",
    conversionRate: total > 0 ? Math.round((won / total) * 100 * 10) / 10 : 0,
    pipelineValue: dealStats?.pipelineValue || "0",
  };
}

export async function getPipelineSummary(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({
    stage: deals.stage,
    count: count(),
    value: sum(deals.value),
  }).from(deals).where(eq(deals.companyId, companyId)).groupBy(deals.stage);
}

export async function getLeadsByStatus(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({
    status: leads.status,
    count: count(),
  }).from(leads).where(eq(leads.companyId, companyId)).groupBy(leads.status);
}

// ===== TRAIL PROGRESS =====
export async function getTrailProgress(companyId: number, userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(trailProgress).where(
    and(eq(trailProgress.companyId, companyId), eq(trailProgress.userId, userId))
  );
}

export async function upsertTrailProgress(companyId: number, userId: number, pillar: string, stepIndex: number, totalSteps: number, status: string) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const existing = await db.select().from(trailProgress).where(
    and(eq(trailProgress.companyId, companyId), eq(trailProgress.userId, userId), eq(trailProgress.pillar, pillar as any))
  ).limit(1);
  if (existing.length > 0) {
    await db.update(trailProgress).set({ stepIndex, status: status as any, completedAt: status === "completed" ? new Date() : null }).where(eq(trailProgress.id, existing[0].id));
  } else {
    await db.insert(trailProgress).values({ companyId, userId, pillar: pillar as any, stepIndex, totalSteps, status: status as any });
  }
}

// ===== AGC ALERTS =====
export async function getAgcAlerts(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(agcAlerts).where(eq(agcAlerts.companyId, companyId)).orderBy(desc(agcAlerts.createdAt));
}

export async function createAgcAlert(data: { companyId: number; severity: "info" | "warning" | "critical"; category: string; title: string; description?: string; recommendation?: string; data?: any }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(agcAlerts).values(data);
  return { id: result[0].insertId };
}

export async function acknowledgeAlert(id: number, userId: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(agcAlerts).set({ acknowledged: true, acknowledgedBy: userId }).where(eq(agcAlerts.id, id));
}

// ===== AUTOMATIONS =====
export async function getAutomations(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(automations).where(eq(automations.companyId, companyId)).orderBy(desc(automations.createdAt));
}

export async function createAutomation(data: { companyId: number; name: string; trigger: any; triggerConfig?: any; action: any; actionConfig?: any }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(automations).values(data);
  return { id: result[0].insertId };
}

export async function toggleAutomation(id: number, isActive: boolean) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(automations).set({ isActive }).where(eq(automations.id, id));
}

export async function deleteAutomation(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(automations).where(eq(automations.id, id));
}

// ===== DIAGNOSTICS =====
export async function saveDiagnostic(data: { companyId: number; userId: number; type: string; answers: any; maturityScore: number; revenueGap: string; projectedRoi: string; analysis?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(diagnostics).values(data);
  return { id: result[0].insertId };
}

export async function getDiagnostics(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(diagnostics).where(eq(diagnostics.companyId, companyId)).orderBy(desc(diagnostics.createdAt));
}

// ===== WHATSAPP MESSAGES (internal) =====
export async function getWhatsappMessages(companyId: number, leadId?: number) {
  const db = await getDb(); if (!db) return [];
  if (leadId) {
    return db.select().from(whatsappMessages).where(
      and(eq(whatsappMessages.companyId, companyId), eq(whatsappMessages.leadId, leadId))
    ).orderBy(whatsappMessages.timestamp);
  }
  return db.select().from(whatsappMessages).where(eq(whatsappMessages.companyId, companyId)).orderBy(desc(whatsappMessages.timestamp)).limit(100);
}

export async function createWhatsappMessage(data: { companyId: number; sessionId: number; leadId?: number; remoteJid: string; fromMe: boolean; content: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(whatsappMessages).values(data);
  return { id: result[0].insertId };
}

// ===== LICENSES =====
export async function createLicense(data: { companyId: number; plan: any; monthlyPrice: string; endDate?: Date }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(licenses).values(data);
  return { id: result[0].insertId };
}

export async function getLicensesByCompany(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(licenses).where(eq(licenses.companyId, companyId)).orderBy(desc(licenses.createdAt));
}
