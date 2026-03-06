import { FastifyInstance } from "fastify";
import { z } from "zod";
import { createInvoice, getInvoice, listInvoices } from "./service.js";
import { normalizeNetworkKey } from "../networks.js";
import { normalizeAssetKey } from "../assets.js";

// Backward compatible: accepts amountKAS OR amount + assetKey
const CreateInvoiceSchema = z
  .object({
    assetKey: z.string().optional(),
    amount: z.string().optional(),
    amountKAS: z.string().optional(),
    memo: z.string().max(200).optional(),
    expiresInMinutes: z.number().int().positive().max(60 * 24 * 7).optional(),
  })
  .refine((v) => (v.amount ?? v.amountKAS) != null, { message: "amount is required" })
  .transform((v) => {
    const amount = (v.amount ?? v.amountKAS ?? "0").toString();
    const assetKey = normalizeAssetKey(v.assetKey);
    return { assetKey, amount, memo: v.memo, expiresInMinutes: v.expiresInMinutes };
  });

export async function invoicesRoutes(app: FastifyInstance) {
  app.get("/invoices", async (req) => {
    const network = normalizeNetworkKey(req.headers["x-kpay-network"] as string | undefined);
    return listInvoices(network);
  });

  app.get("/invoices/:id", async (req, reply) => {
    const id = (req.params as any).id as string;
    const invoice = await getInvoice(id);
    if (!invoice) return reply.code(404).send({ error: "NOT_FOUND" });
    return invoice;
  });

  app.post("/invoices", async (req, reply) => {
    const parsed = CreateInvoiceSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: "VALIDATION_ERROR", details: parsed.error.flatten() });

    const network = normalizeNetworkKey(req.headers["x-kpay-network"] as string | undefined);
    const providerKey = (req.headers["x-kpay-provider"] as string | undefined) ?? "public";
    const invoice = await createInvoice({ network, providerKey, ...parsed.data });
    return reply.code(201).send(invoice);
  });
}
