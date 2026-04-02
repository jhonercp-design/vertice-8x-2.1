import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM, type Message } from "./_core/llm";
import { z } from "zod";

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

  ai: router({
    chat: protectedProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["system", "user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const llmMessages: Message[] = input.messages.map((m) => ({
          role: m.role as "system" | "user" | "assistant",
          content: m.content,
        }));
        const response = await invokeLLM({ messages: llmMessages });
        const rawContent = response.choices?.[0]?.message?.content;
        const content: string = typeof rawContent === "string"
          ? rawContent
          : "Desculpe, não consegui processar sua mensagem.";
        return { content };
      }),
  }),
});

export type AppRouter = typeof appRouter;
