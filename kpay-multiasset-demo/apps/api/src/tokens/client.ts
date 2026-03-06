import { env } from "../env.js";
import type { NetworkKey } from "../networks.js";

export type TokenActivity = {
  txId: string;
  amountAtomic: string;
  confirmations: number;
  firstSeenAt: Date;
};

async function fetchJson(url: string, apiKey?: string) {
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["api-key"] = apiKey;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`token indexer error ${r.status}`);
  return r.json();
}

function indexerBaseFor(network: NetworkKey) {
  return network === "mainnet" ? env.TOKEN_INDEXER_MAINNET_URL : env.TOKEN_INDEXER_TESTNET_URL;
}

/**
 * Generic token activity lookup.
 * Expected indexer shape (flexible):
 *   GET {base}/transfers?address=...&token=...
 * Returns an array where the first element includes: txId, amount, confirmations
 */
export async function getTokenAddressActivity(network: NetworkKey, address: string, tokenId: string): Promise<TokenActivity | null> {
  const base = indexerBaseFor(network);
  if (!base) throw new Error("TOKEN_INDEXER not configured");
  const clean = base.replace(/\/$/, "");
  const url = `${clean}/transfers?address=${encodeURIComponent(address)}&token=${encodeURIComponent(tokenId)}`;

  const data = await fetchJson(url, env.TOKEN_INDEXER_API_KEY);
  const arr = Array.isArray(data) ? data : (data?.transfers ?? data?.data ?? []);
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const t = arr[0] as any;
  return {
    txId: (t.txId ?? t.transactionId ?? "unknown_tx").toString(),
    amountAtomic: (t.amountAtomic ?? t.amount ?? t.value ?? "0").toString(),
    confirmations: Number(t.confirmations ?? 1),
    firstSeenAt: new Date(t.timestamp ?? Date.now()),
  };
}
