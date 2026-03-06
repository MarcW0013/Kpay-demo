import type { ProviderConfig } from "../providers/provider.js";
import { getUtxos } from "../providers/rest.js";
import { env } from "../env.js";

export type AddressActivity = {
  txId: string;
  amountAtomic: string;
  confirmations: number;
  firstSeenAt: Date;
};

export async function getKaspaAddressActivity(provider: ProviderConfig, address: string): Promise<AddressActivity | null> {
  const utxos = await getUtxos(provider.restBaseUrl, address, provider.apiKey);
  if (!utxos || utxos.length === 0) return null;

  const u = utxos[0];
  const txId = (u.outpoint?.transactionId ?? u.transactionId ?? "unknown_tx").toString();
  const amountAtomic = (u.amount ?? u.value ?? "0").toString();
  const confirmations = u.isConfirmed ? env.KASPA_CONFIRMATIONS : 1;

  return { txId, amountAtomic, confirmations, firstSeenAt: new Date() };
}
