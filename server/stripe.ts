import Stripe from "stripe";
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-12-18.acacia" });

export const stripeRouter = router({
  createCheckout: protectedProcedure
    .input(z.object({ planId: z.string(), quantity: z.number().default(1) }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: input.planId,
            quantity: input.quantity,
          },
        ],
        mode: "subscription",
        success_url: `${ctx.req.headers.origin}/admin?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/admin`,
        customer_email: ctx.user.email || undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "User",
        },
        allow_promotion_codes: true,
      });

      return { checkoutUrl: session.url };
    }),

  getPaymentHistory: protectedProcedure.query(async ({ ctx }) => {
    const invoices = await stripe.invoices.list({
      customer: ctx.user.stripeCustomerId || undefined,
      limit: 10,
    });

    return invoices.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000),
      amount: invoice.amount_paid / 100,
      status: invoice.status,
      url: invoice.hosted_invoice_url,
    }));
  }),

  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.stripeCustomerId) return null;

    const subscriptions = await stripe.subscriptions.list({
      customer: ctx.user.stripeCustomerId,
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    if (!subscription) return null;

    return {
      id: subscription.id,
      status: subscription.status,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      plan: subscription.items.data[0]?.price?.nickname || "Plan",
    };
  }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.stripeCustomerId) throw new Error("No customer found");

    const subscriptions = await stripe.subscriptions.list({
      customer: ctx.user.stripeCustomerId,
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    if (!subscription) throw new Error("No subscription found");

    await stripe.subscriptions.cancel(subscription.id);
    return { success: true };
  }),
});
