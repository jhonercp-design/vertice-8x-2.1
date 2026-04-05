import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Pipeline Management", () => {
  const testCompanyId = 1;
  let createdPipelineId: number;

  beforeAll(async () => {
    // Setup if needed
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  it("should create a pipeline", async () => {
    const result = await db.createPipeline({
      companyId: testCompanyId,
      name: "Test Pipeline",
      stages: [
        { id: "new", label: "Novo", color: "bg-gray-500" },
        { id: "contacted", label: "Contato", color: "bg-blue-500" },
      ],
      isDefault: false,
    });

    expect(result).toHaveProperty("id");
    createdPipelineId = result.id;
  });

  it("should get pipelines by company", async () => {
    const pipelines = await db.getPipelines(testCompanyId);
    expect(Array.isArray(pipelines)).toBe(true);
    expect(pipelines.length).toBeGreaterThan(0);
  });

  it("should get pipeline by id", async () => {
    const pipeline = await db.getPipelineById(createdPipelineId);
    expect(pipeline).toBeDefined();
    expect(pipeline?.name).toBe("Test Pipeline");
  });

  it("should update a pipeline", async () => {
    await db.updatePipeline(createdPipelineId, {
      name: "Updated Pipeline",
    });

    const pipeline = await db.getPipelineById(createdPipelineId);
    expect(pipeline?.name).toBe("Updated Pipeline");
  });

  it("should set pipeline as default", async () => {
    await db.updatePipeline(createdPipelineId, { isDefault: true });
    const pipeline = await db.getPipelineById(createdPipelineId);
    expect(pipeline?.isDefault).toBe(true);
  });

  it("should get default pipeline", async () => {
    const defaultPipeline = await db.getDefaultPipeline(testCompanyId);
    expect(defaultPipeline).toBeDefined();
    expect(defaultPipeline?.isDefault).toBe(true);
  });

  it("should delete a pipeline", async () => {
    await db.deletePipeline(createdPipelineId);
    const pipeline = await db.getPipelineById(createdPipelineId);
    expect(pipeline).toBeNull();
  });
});
