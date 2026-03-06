import type { NetworkKey } from "./network";
import { getStoredNetwork } from "./network";
import { getStoredProvider, type ProviderKey } from "./provider";

export type Invoice = {
  id: string;
  createdAt: string;
  updatedAt: string;
  network: "MAINNET" | "TESTNET_TN10";
  assetKey: string;
  assetSymbol: string;
  providerKey: string;
  amount: string;
  memo?: string | null;
  address: string;
  status: "PENDING" | "SEEN" | "CONFIRMED" | "EXPIRED";
  txId?: string | null;
  confirmations: number;
  expiresAt?: string | null;
};

const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function headersForContext(network?: NetworkKey, provider?: ProviderKey): HeadersInit {
  const n = network ?? (typeof window !== "undefined" ? getStoredNetwork() : "testnet");
  const p = provider ?? (typeof window !== "undefined" ? getStoredProvider() : "public");
  return {
    "content-type": "application/json",
    "x-kpay-network": n,
    "x-kpay-provider": p,
  };
}

export async function listInvoices(network?: NetworkKey): Promise<Invoice[]> {
  const r = await fetch(`${base}/invoices`, { headers: headersForContext(network) });
  if (!r.ok) throw new Error("Failed to load invoices");
  return r.json();
}

export async function getInvoice(id: string, network?: NetworkKey): Promise<Invoice> {
  const r = await fetch(`${base}/invoices/${id}`, { headers: headersForContext(network) });
  if (!r.ok) throw new Error("Failed to load invoice");
  return r.json();
}

export async function createInvoice(
  input: { assetKey?: string; amount?: string; amountKAS?: string; memo?: string; expiresInMinutes?: number },
  network?: NetworkKey,
  provider?: ProviderKey
): Promise<Invoice> {
  const r = await fetch(`${base}/invoices`, {
    method: "POST",
    headers: headersForContext(network, provider),
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export function confirmationsLabel(n: number, threshold: number) {
  return `${Math.min(n, threshold)}/${threshold} confirmations`;
}
