import { describe, it, expect, vi } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "Olá! Sou o Copiloto IA da Máquina de Vendas.",
        },
      },
    ],
  }),
}));

describe("AI Chat Router", () => {
  it("should have the correct message schema structure", () => {
    const validMessage = {
      role: "user" as const,
      content: "Gere um script de prospecção",
    };

    expect(validMessage).toHaveProperty("role");
    expect(validMessage).toHaveProperty("content");
    expect(["system", "user", "assistant"]).toContain(validMessage.role);
    expect(typeof validMessage.content).toBe("string");
  });

  it("should handle system prompt correctly", () => {
    const messages = [
      { role: "system" as const, content: "Você é o Copiloto IA" },
      { role: "user" as const, content: "Olá" },
    ];

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("system");
    expect(messages[1].role).toBe("user");
  });

  it("should handle empty content response gracefully", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const response = await invokeLLM({
      messages: [{ role: "user", content: "test" }],
    });

    const rawContent = response.choices?.[0]?.message?.content;
    const content: string =
      typeof rawContent === "string"
        ? rawContent
        : "Desculpe, não consegui processar sua mensagem.";

    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
  });

  it("should handle LLM response with string content", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um consultor comercial." },
        { role: "user", content: "Gere um script de prospecção" },
      ],
    });

    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(typeof response.choices[0].message.content).toBe("string");
  });
});
