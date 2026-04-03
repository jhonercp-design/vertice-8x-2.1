import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Analysis History Backend", () => {
  const testCompanyId = 1;
  const testUserId = 1;

  describe("getAgcAlertsHistory", () => {
    it("should return alerts for a company with pagination", async () => {
      const alerts = await db.getAgcAlertsHistory(testCompanyId, 10, 0);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const alerts = await db.getAgcAlertsHistory(testCompanyId, 5, 0);
      expect(alerts.length).toBeLessThanOrEqual(5);
    });

    it("should return empty array for non-existent company", async () => {
      const alerts = await db.getAgcAlertsHistory(99999, 10, 0);
      expect(alerts.length).toBe(0);
    });
  });

  describe("getAgcAlertsByType", () => {
    it("should filter alerts by category", async () => {
      const alerts = await db.getAgcAlertsByType(testCompanyId, "pipeline");
      expect(Array.isArray(alerts)).toBe(true);
      alerts.forEach((alert) => {
        expect(alert.category).toBe("pipeline");
      });
    });
  });

  describe("getAgcAlertsHistoryByDateRange", () => {
    it("should return alerts within date range", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const alerts = await db.getAgcAlertsHistoryByDateRange(testCompanyId, startDate, endDate);
      expect(Array.isArray(alerts)).toBe(true);
      
      alerts.forEach((alert) => {
        const alertDate = new Date(alert.createdAt);
        expect(alertDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(alertDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe("getAgcAlertsSummary", () => {
    it("should return summary with correct structure", async () => {
      const summary = await db.getAgcAlertsSummary(testCompanyId);
      
      expect(summary).toHaveProperty("total");
      expect(summary).toHaveProperty("bySeverity");
      expect(summary).toHaveProperty("acknowledged");
      expect(summary).toHaveProperty("lastAlertAt");
      
      expect(typeof summary.total).toBe("number");
      expect(typeof summary.acknowledged).toBe("number");
    });

    it("should have severity counts", async () => {
      const summary = await db.getAgcAlertsSummary(testCompanyId);
      const bySeverity = summary.bySeverity as Record<string, number>;
      
      // Should have keys for severity levels if alerts exist
      if (summary.total > 0) {
        const severityKeys = Object.keys(bySeverity);
        expect(severityKeys.length).toBeGreaterThan(0);
        severityKeys.forEach((key) => {
          expect(["critical", "warning", "info"]).toContain(key);
        });
      }
    });
  });

  describe("updateAgcAlertStatus", () => {
    it("should update alert acknowledged status", async () => {
      // First, get an alert to update
      const alerts = await db.getAgcAlertsHistory(testCompanyId, 1, 0);
      
      if (alerts.length > 0) {
        const alertId = alerts[0].id;
        const originalStatus = alerts[0].acknowledged;
        
        // Update the status
        await db.updateAgcAlertStatus(alertId, !originalStatus, testUserId);
        
        // Verify the update
        const updatedAlerts = await db.getAgcAlertsHistory(testCompanyId, 1, 0);
        expect(updatedAlerts[0].acknowledged).toBe(!originalStatus);
        expect(updatedAlerts[0].acknowledgedBy).toBe(testUserId);
      }
    });
  });

  describe("Integration: Full workflow", () => {
    it("should handle complete analysis history workflow", async () => {
      // 1. Get summary
      const summary = await db.getAgcAlertsSummary(testCompanyId);
      expect(summary.total).toBeGreaterThanOrEqual(0);

      // 2. Get alerts with pagination
      const alerts = await db.getAgcAlertsHistory(testCompanyId, 10, 0);
      expect(Array.isArray(alerts)).toBe(true);

      // 3. Filter by date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      const weekAlerts = await db.getAgcAlertsHistoryByDateRange(testCompanyId, startDate, endDate);
      expect(Array.isArray(weekAlerts)).toBe(true);

      // 4. Filter by category
      if (alerts.length > 0) {
        const category = alerts[0].category;
        const categoryAlerts = await db.getAgcAlertsByType(testCompanyId, category);
        expect(Array.isArray(categoryAlerts)).toBe(true);
      }
    });
  });
});
