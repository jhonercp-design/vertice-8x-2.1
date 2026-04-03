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
  goals,
  kpis,
  products,
  projects,
  playbooks,
  proposals,
  gamificationScores,
  callTranscriptions,
  callAnalyses,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ===== USERS =====
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => { const value = user[field]; if (value === undefined) return; const normalized = value ?? null; values[field] = normalized; updateSet[field] = normalized; };
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
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsers(companyId?: number) {
  const db = await getDb(); if (!db) return [];
  if (companyId) return db.select().from(users).where(eq(users.companyId, companyId));
  return db.select().from(users);
}

export async function updateUserLayer(userId: number, layer: "direcao" | "gerente" | "operacional") {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(users).set({ layer }).where(eq(users.id, userId));
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
    query = db.select().from(leads).where(and(eq(leads.companyId, companyId), or(like(leads.name, `%${search}%`), like(leads.company, `%${search}%`))));
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
  const db = await getDb(); if (!db) return { totalCompanies: 0, activeCompanies: 0, totalUsers: 0, totalMrr: "0", churnRate: 0 };
  const [companyStats] = await db.select({ totalCompanies: count(), activeCompanies: sum(sql`CASE WHEN ${companies.status} = 'active' THEN 1 ELSE 0 END`) }).from(companies);
  const [userStats] = await db.select({ totalUsers: count() }).from(users);
  const [licenseStats] = await db.select({ totalMrr: sum(licenses.monthlyPrice) }).from(licenses).where(eq(licenses.status, "active"));
  const totalC = companyStats?.totalCompanies || 0;
  const activeC = Number(companyStats?.activeCompanies) || 0;
  return {
    totalCompanies: totalC,
    activeCompanies: activeC,
    totalUsers: userStats?.totalUsers || 0,
    totalMrr: licenseStats?.totalMrr || "0",
    churnRate: totalC > 0 ? Math.round(((totalC - activeC) / totalC) * 100 * 10) / 10 : 0,
  };
}

// ===== DASHBOARD KPIs =====
export async function getDashboardKpis(companyId: number) {
  const db = await getDb(); if (!db) return { totalLeads: 0, totalRevenue: "0", conversionRate: 0, pipelineValue: "0", wonDeals: 0, totalDeals: 0 };
  const [leadStats] = await db.select({ totalLeads: count(), wonLeads: sum(sql`CASE WHEN ${leads.status} = 'won' THEN 1 ELSE 0 END`) }).from(leads).where(eq(leads.companyId, companyId));
  const [dealStats] = await db.select({ pipelineValue: sum(deals.value), wonValue: sum(sql`CASE WHEN ${deals.stage} = 'won' THEN ${deals.value} ELSE 0 END`), totalDeals: count(), wonDeals: sum(sql`CASE WHEN ${deals.stage} = 'won' THEN 1 ELSE 0 END`) }).from(deals).where(eq(deals.companyId, companyId));
  const total = leadStats?.totalLeads || 0;
  const won = Number(leadStats?.wonLeads) || 0;
  return {
    totalLeads: total,
    totalRevenue: dealStats?.wonValue || "0",
    conversionRate: total > 0 ? Math.round((won / total) * 100 * 10) / 10 : 0,
    pipelineValue: dealStats?.pipelineValue || "0",
    wonDeals: Number(dealStats?.wonDeals) || 0,
    totalDeals: dealStats?.totalDeals || 0,
  };
}

export async function getPipelineSummary(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ stage: deals.stage, count: count(), value: sum(deals.value) }).from(deals).where(eq(deals.companyId, companyId)).groupBy(deals.stage);
}

export async function getLeadsByStatus(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ status: leads.status, count: count() }).from(leads).where(eq(leads.companyId, companyId)).groupBy(leads.status);
}

// ===== TRAIL PROGRESS =====
export async function getTrailProgress(companyId: number, userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(trailProgress).where(and(eq(trailProgress.companyId, companyId), eq(trailProgress.userId, userId)));
}

export async function upsertTrailProgress(companyId: number, userId: number, pillar: string, stepIndex: number, totalSteps: number, status: string) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const existing = await db.select().from(trailProgress).where(and(eq(trailProgress.companyId, companyId), eq(trailProgress.userId, userId), eq(trailProgress.pillar, pillar as any))).limit(1);
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

// ===== WHATSAPP =====
export async function getWhatsappMessages(companyId: number, leadId?: number) {
  const db = await getDb(); if (!db) return [];
  if (leadId) return db.select().from(whatsappMessages).where(and(eq(whatsappMessages.companyId, companyId), eq(whatsappMessages.leadId, leadId))).orderBy(whatsappMessages.timestamp);
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

// ===== GOALS =====
export async function getGoals(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(goals).where(eq(goals.companyId, companyId)).orderBy(desc(goals.updatedAt));
}

export async function createGoal(data: { companyId: number; userId?: number; label: string; target: string; current?: string; unit?: string; period?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(goals).values(data);
  return { id: result[0].insertId };
}

export async function updateGoal(id: number, data: { label?: string; target?: string; current?: string; unit?: string; period?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(goals).set(data).where(eq(goals.id, id));
}

export async function deleteGoal(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(goals).where(eq(goals.id, id));
}

// ===== KPIs =====
export async function getKpis(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(kpis).where(eq(kpis.companyId, companyId)).orderBy(desc(kpis.updatedAt));
}

export async function createKpi(data: { companyId: number; label: string; value?: string; change?: string; trend?: "up" | "down" | "stable"; category?: string; unit?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(kpis).values(data);
  return { id: result[0].insertId };
}

export async function updateKpi(id: number, data: { label?: string; value?: string; change?: string; trend?: "up" | "down" | "stable"; category?: string; unit?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(kpis).set(data).where(eq(kpis.id, id));
}

export async function deleteKpi(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(kpis).where(eq(kpis.id, id));
}

// ===== PRODUCTS =====
export async function getProducts(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(products).where(eq(products.companyId, companyId)).orderBy(desc(products.updatedAt));
}

export async function createProduct(data: { companyId: number; name: string; description?: string; category?: string; price?: string; status?: "active" | "inactive" | "draft" }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(products).values(data);
  return { id: result[0].insertId };
}

export async function updateProduct(id: number, data: { name?: string; description?: string; category?: string; price?: string; status?: "active" | "inactive" | "draft" }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

// ===== PROJECTS =====
export async function getProjects(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(projects).where(eq(projects.companyId, companyId)).orderBy(desc(projects.updatedAt));
}

export async function createProject(data: { companyId: number; name: string; client?: string; status?: "planning" | "execution" | "review" | "completed"; budget?: string; category?: string; deadline?: Date }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(projects).values(data);
  return { id: result[0].insertId };
}

export async function updateProject(id: number, data: { name?: string; client?: string; status?: "planning" | "execution" | "review" | "completed"; progress?: number; budget?: string; spent?: string; category?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(projects).where(eq(projects.id, id));
}

// ===== PLAYBOOKS =====
export async function getPlaybooks(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(playbooks).where(eq(playbooks.companyId, companyId)).orderBy(desc(playbooks.updatedAt));
}

export async function createPlaybook(data: { companyId: number; name: string; framework?: string; steps?: number; content?: any }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(playbooks).values(data);
  return { id: result[0].insertId };
}

export async function updatePlaybook(id: number, data: { name?: string; framework?: string; steps?: number; usageRate?: number; isActive?: boolean; content?: any })  {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(playbooks).set(data).where(eq(playbooks.id, id));
}

export async function deletePlaybook(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(playbooks).where(eq(playbooks.id, id));
}

// ===== PROPOSALS =====
export async function getProposals(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(proposals).where(eq(proposals.companyId, companyId)).orderBy(desc(proposals.updatedAt));
}

export async function createProposal(data: { companyId: number; dealId?: number; leadId?: number; title: string; value?: string; content?: any }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(proposals).values(data);
  return { id: result[0].insertId };
}

export async function updateProposal(id: number, data: { title?: string; value?: string; status?: "draft" | "sent" | "viewed" | "negotiation" | "signed" | "rejected"; sentAt?: Date; signedAt?: Date; content?: any }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function deleteProposal(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(proposals).where(eq(proposals.id, id));
}

// ===== GAMIFICATION =====
export async function getGamificationScores(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(gamificationScores).where(eq(gamificationScores.companyId, companyId)).orderBy(desc(gamificationScores.points));
}

export async function upsertGamificationScore(companyId: number, userId: number, pointsToAdd: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const existing = await db.select().from(gamificationScores).where(and(eq(gamificationScores.companyId, companyId), eq(gamificationScores.userId, userId))).limit(1);
  if (existing.length > 0) {
    const newPoints = (existing[0].points || 0) + pointsToAdd;
    const newLevel = Math.floor(newPoints / 100) + 1;
    await db.update(gamificationScores).set({ points: newPoints, level: newLevel, weeklyPoints: (existing[0].weeklyPoints || 0) + pointsToAdd, monthlyPoints: (existing[0].monthlyPoints || 0) + pointsToAdd }).where(eq(gamificationScores.id, existing[0].id));
  } else {
    await db.insert(gamificationScores).values({ companyId, userId, points: pointsToAdd, level: 1, weeklyPoints: pointsToAdd, monthlyPoints: pointsToAdd });
  }
}


// ===== CALL TRANSCRIPTIONS =====
export async function getCallTranscriptions(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(callTranscriptions).where(eq(callTranscriptions.companyId, companyId)).orderBy(desc(callTranscriptions.createdAt));
}

export async function createCallTranscription(data: { companyId: number; userId: number; leadId?: number; dealId?: number; title: string; audioUrl?: string; transcription?: string; duration?: number; recordedAt?: Date }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(callTranscriptions).values(data);
  return { id: result[0].insertId };
}

export async function updateCallTranscription(id: number, data: { transcription?: string; status?: "pending" | "transcribed" | "analyzed" | "archived" }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(callTranscriptions).set(data).where(eq(callTranscriptions.id, id));
}

// ===== CALL ANALYSES =====
export async function getCallAnalyses(companyId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(callAnalyses).where(eq(callAnalyses.companyId, companyId)).orderBy(desc(callAnalyses.createdAt));
}

export async function createCallAnalysis(data: { transcriptionId: number; companyId: number; sentiment?: string; sentimentScore?: string; keyPoints?: any; strengths?: any; weaknesses?: any; frameworkEvaluation?: any; recommendations?: any; score?: number; analysisText?: string }) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(callAnalyses).values(data);
  return { id: result[0].insertId };
}

export async function getCallAnalysisByTranscription(transcriptionId: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(callAnalyses).where(eq(callAnalyses.transcriptionId, transcriptionId)).limit(1);
  return result[0] || null;
}
