import { prisma } from "../prisma.js";
import { env } from "../env.js";
import { ASSETS } from "../assets.js";
import { getKaspaAddressActivity } from "../kaspa/client.js";
import { getTokenAddressActivity } from "../tokens/client.js";
import { providerConfigFor } from "../providers/resolve.js";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function invoiceNetworkKey(n: any): "mainnet" | "testnet" {
  return n === "MAINNET" ? "mainnet" : "testnet";
}

async function mockTransition(inv: any, now: number) {
  const isToken = (ASSETS as any)[inv.assetKey]?.type === "token";
  const seenAfter = isToken ? env.TOKEN_MOCK_SEEN_SECONDS : env.KASPA_MOCK_SEEN_SECONDS;
  const confirmedAfter = isToken ? env.TOKEN_MOCK_CONFIRMED_SECONDS : env.KASPA_MOCK_CONFIRMED_SECONDS;

  const ageSec = Math.floor((now - inv.createdAt.getTime()) / 1000);

  if (inv.status === "PENDING" && ageSec >= seenAfter) {
    await prisma.invoice.update({
      where: { id: inv.id },
      data: {
        status: "SEEN",
        txId: inv.txId ?? `demo_tx_${inv.id.slice(-6)}`,
        confirmations: Math.max(inv.confirmations, 1),
        seenAt: new Date(),
      },
    });
    return;
  }

  if (inv.status === "SEEN") {
    const confirmations = Math.min(env.KASPA_CONFIRMATIONS, Math.max(inv.confirmations, Math.floor(ageSec / 3)));
    const shouldConfirm = ageSec >= confirmedAfter;
    await prisma.invoice.update({
      where: { id: inv.id },
      data: {
        confirmations,
        ...(shouldConfirm ? { status: "CONFIRMED", confirmedAt: inv.confirmedAt ?? new Date() } : {}),
      },
    });
  }
}

export async function runPollerOnce() {
  await prisma.invoice.updateMany({
    where: { status: { in: ["PENDING", "SEEN"] }, expiresAt: { not: null, lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  const invoices = await prisma.invoice.findMany({
    where: { status: { in: ["PENDING", "SEEN"] } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const now = Date.now();

  for (const inv of invoices) {
    const network = invoiceNetworkKey(inv.network);
    const asset = (ASSETS as any)[inv.assetKey] ?? ASSETS.KAS;

    try {
      if (asset.type === "native") {
        const provider = providerConfigFor(network, (inv.providerKey as any) ?? "public");
        const activity = await getKaspaAddressActivity(provider, inv.address);
        if (!activity) continue;
        const nextStatus = activity.confirmations >= env.KASPA_CONFIRMATIONS ? "CONFIRMED" : "SEEN";
        await prisma.invoice.update({
          where: { id: inv.id },
          data: {
            status: nextStatus as any,
            txId: activity.txId,
            confirmations: activity.confirmations,
            seenAt: inv.seenAt ?? activity.firstSeenAt,
            confirmedAt: nextStatus === "CONFIRMED" ? inv.confirmedAt ?? new Date() : inv.confirmedAt,
          },
        });
      } else {
        const tokenId = asset.tokenId ?? asset.symbol;
        const activity = await getTokenAddressActivity(network, inv.address, tokenId);
        if (!activity) continue;
        const nextStatus = activity.confirmations >= env.KASPA_CONFIRMATIONS ? "CONFIRMED" : "SEEN";
        await prisma.invoice.update({
          where: { id: inv.id },
          data: {
            status: nextStatus as any,
            txId: activity.txId,
            confirmations: activity.confirmations,
            seenAt: inv.seenAt ?? activity.firstSeenAt,
            confirmedAt: nextStatus === "CONFIRMED" ? inv.confirmedAt ?? new Date() : inv.confirmedAt,
          },
        });
      }
    } catch (e) {
      const allowMock = asset.type === "token" ? env.TOKEN_MOCK_FALLBACK : env.KASPA_MOCK_FALLBACK;
      if (allowMock) await mockTransition(inv, now);
    }
  }
}

export async function startPoller() {
  const intervalMs = 2500;
  console.log(`[poller] started (interval=${intervalMs}ms, kaspaMock=${env.KASPA_MOCK_FALLBACK}, tokenMock=${env.TOKEN_MOCK_FALLBACK})`);
  while (true) {
    try {
      await runPollerOnce();
    } catch (e) {
      console.error("[poller] error:", e);
    }
    await sleep(intervalMs);
  }
}
