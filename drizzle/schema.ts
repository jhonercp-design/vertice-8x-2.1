import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

// ===== USERS =====
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  layer: mysqlEnum("layer", ["direcao", "gerente", "operacional"]).default("operacional").notNull(),
  companyId: int("companyId"),
  avatarUrl: text("avatarUrl"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== COMPANIES (Multi-Tenant) =====
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  segment: varchar("segment", { length: 100 }),
  website: varchar("website", { length: 500 }),
  logoUrl: text("logoUrl"),
  ownerId: int("ownerId"),
  plan: mysqlEnum("plan", ["trial", "starter", "professional", "enterprise"]).default("trial").notNull(),
  maxSeats: int("maxSeats").default(3).notNull(),
  status: mysqlEnum("status", ["active", "suspended", "cancelled"]).default("active").notNull(),
  trialEndsAt: timestamp("trialEndsAt"),
  maturityScore: int("maturityScore"),
  revenueGap: decimal("revenueGap", { precision: 12, scale: 2 }),
  projectedRoi: decimal("projectedRoi", { precision: 12, scale: 2 }),
  onboardingData: json("onboardingData"),
  onboardingCompleted: boolean("onboardingCompleted").default(false),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ===== LICENSES =====
export const licenses = mysqlTable("licenses", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  plan: mysqlEnum("plan", ["trial", "starter", "professional", "enterprise"]).notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type License = typeof licenses.$inferSelect;

// ===== LEADS (CRM) =====
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  assignedTo: int("assignedTo"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  company: varchar("company", { length: 255 }),
  position: varchar("position", { length: 150 }),
  source: varchar("source", { length: 100 }),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  icpScore: int("icpScore"),
  icpFit: mysqlEnum("icpFit", ["A", "B", "C", "D"]),
  notes: text("notes"),
  tags: json("tags"),
  lastContactAt: timestamp("lastContactAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ===== DEALS (Pipeline) =====
export const deals = mysqlTable("deals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  leadId: int("leadId"),
  assignedTo: int("assignedTo"),
  title: varchar("title", { length: 255 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  stage: mysqlEnum("stage", ["prospecting", "qualification", "proposal", "negotiation", "closing", "won", "lost"]).default("prospecting").notNull(),
  probability: int("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  closedAt: timestamp("closedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

// ===== ACTIVITIES (Timeline) =====
export const activities = mysqlTable("activities", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  leadId: int("leadId"),
  dealId: int("dealId"),
  userId: int("userId"),
  type: mysqlEnum("type", ["note", "call", "email", "meeting", "whatsapp", "proposal", "diagnostic", "agc_alert", "task", "status_change"]).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

// ===== WHATSAPP SESSIONS =====
export const whatsappSessions = mysqlTable("whatsapp_sessions", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  sessionName: varchar("sessionName", { length: 100 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 30 }),
  status: mysqlEnum("status", ["disconnected", "connecting", "connected"]).default("disconnected").notNull(),
  qrCode: text("qrCode"),
  lastConnectedAt: timestamp("lastConnectedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WhatsAppSession = typeof whatsappSessions.$inferSelect;

// ===== WHATSAPP MESSAGES =====
export const whatsappMessages = mysqlTable("whatsapp_messages", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  sessionId: int("sessionId").notNull(),
  leadId: int("leadId"),
  remoteJid: varchar("remoteJid", { length: 100 }).notNull(),
  fromMe: boolean("fromMe").default(false).notNull(),
  messageType: varchar("messageType", { length: 50 }).default("text"),
  content: text("content"),
  mediaUrl: text("mediaUrl"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "delivered", "read", "failed"]).default("sent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect;

// ===== TRANSFORMATION TRAIL (5 Pillars) =====
export const trailProgress = mysqlTable("trail_progress", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  pillar: mysqlEnum("pillar", ["anatomia", "arquitetura", "ativacao", "aceleracao", "autoridade"]).notNull(),
  stepIndex: int("stepIndex").default(0).notNull(),
  totalSteps: int("totalSteps").default(5).notNull(),
  status: mysqlEnum("status", ["locked", "in_progress", "completed"]).default("locked").notNull(),
  completedAt: timestamp("completedAt"),
  data: json("data"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrailProgress = typeof trailProgress.$inferSelect;

// ===== AGC ALERTS (Governance Agent) =====
export const agcAlerts = mysqlTable("agc_alerts", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  recommendation: text("recommendation"),
  data: json("data"),
  acknowledged: boolean("acknowledged").default(false),
  acknowledgedBy: int("acknowledgedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgcAlert = typeof agcAlerts.$inferSelect;

// ===== AI CONVERSATIONS =====
export const aiConversations = mysqlTable("ai_conversations", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["copilot", "agc"]).default("copilot").notNull(),
  title: varchar("title", { length: 255 }),
  messages: json("messages"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiConversation = typeof aiConversations.$inferSelect;

// ===== AUTOMATIONS =====
export const automations = mysqlTable("automations", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  trigger: mysqlEnum("trigger", ["lead_status_change", "deal_stage_change", "agc_alert", "scheduled", "manual"]).notNull(),
  triggerConfig: json("triggerConfig"),
  action: mysqlEnum("action", ["send_whatsapp", "create_task", "send_email", "notify_team", "update_lead"]).notNull(),
  actionConfig: json("actionConfig"),
  isActive: boolean("isActive").default(true).notNull(),
  executionCount: int("executionCount").default(0),
  lastExecutedAt: timestamp("lastExecutedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Automation = typeof automations.$inferSelect;

// ===== DIAGNOSTICS (Onboarding) =====
export const diagnostics = mysqlTable("diagnostics", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  answers: json("answers"),
  maturityScore: int("maturityScore"),
  revenueGap: decimal("revenueGap", { precision: 12, scale: 2 }),
  projectedRoi: decimal("projectedRoi", { precision: 12, scale: 2 }),
  analysis: text("analysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Diagnostic = typeof diagnostics.$inferSelect;

// ===== GOALS (Metas) =====
export const goals = mysqlTable("goals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId"),
  label: varchar("label", { length: 255 }).notNull(),
  target: decimal("target", { precision: 14, scale: 2 }).notNull(),
  current: decimal("current", { precision: 14, scale: 2 }).default("0"),
  unit: varchar("unit", { length: 20 }).default("R$"),
  period: varchar("period", { length: 50 }).default("monthly"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Goal = typeof goals.$inferSelect;

// ===== KPIs =====
export const kpis = mysqlTable("kpis", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  value: decimal("value", { precision: 14, scale: 2 }).default("0"),
  change: decimal("change", { precision: 8, scale: 2 }).default("0"),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable"),
  category: varchar("category", { length: 100 }).default("Vendas"),
  unit: varchar("unit", { length: 20 }).default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KPI = typeof kpis.$inferSelect;

// ===== PRODUCTS =====
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  price: decimal("price", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["active", "inactive", "draft"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ===== PROJECTS =====
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  client: varchar("client", { length: 255 }),
  status: mysqlEnum("status", ["planning", "execution", "review", "completed"]).default("planning").notNull(),
  progress: int("progress").default(0),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  spent: decimal("spent", { precision: 12, scale: 2 }).default("0"),
  deadline: timestamp("deadline"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;

// ===== PLAYBOOKS =====
export const playbooks = mysqlTable("playbooks", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  framework: varchar("framework", { length: 100 }),
  steps: int("steps").default(0),
  usageRate: int("usageRate").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  content: json("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Playbook = typeof playbooks.$inferSelect;

// ===== PROPOSALS =====
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  dealId: int("dealId"),
  leadId: int("leadId"),
  title: varchar("title", { length: 255 }).notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "negotiation", "signed", "rejected"]).default("draft").notNull(),
  sentAt: timestamp("sentAt"),
  signedAt: timestamp("signedAt"),
  content: json("content"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;

// ===== GAMIFICATION =====
export const gamificationScores = mysqlTable("gamification_scores", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  userId: int("userId").notNull(),
  points: int("points").default(0),
  level: int("level").default(1),
  badges: json("badges"),
  weeklyPoints: int("weeklyPoints").default(0),
  monthlyPoints: int("monthlyPoints").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GamificationScore = typeof gamificationScores.$inferSelect;
