import type { NetworkKey } from "../networks.js";

export type ProviderKey = "nownodes" | "public";

export function normalizeProviderKey(input?: string): ProviderKey {
  const v = (input ?? "").toLowerCase();
  return v === "nownodes" ? "nownodes" : "public";
}

export type ProviderConfig = {
  key: ProviderKey;
  restBaseUrl: string;
  apiKey?: string;
};

export type ProviderSelector = {
  network: NetworkKey;
  provider: ProviderKey;
};
