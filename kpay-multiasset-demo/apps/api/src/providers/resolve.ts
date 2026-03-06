import type { NetworkKey } from "../networks.js";
import { env } from "../env.js";
import type { ProviderConfig, ProviderKey } from "./provider.js";

export function providerConfigFor(network: NetworkKey, provider: ProviderKey): ProviderConfig {
  if (provider === "nownodes") {
    const restBaseUrl = network === "mainnet" ? env.KASPA_MAINNET_REST_URL_NOWNODES : (env.KASPA_TESTNET_REST_URL_NOWNODES || env.KASPA_TESTNET_REST_URL_PUBLIC);
    return { key: "nownodes", restBaseUrl, apiKey: network === "mainnet" ? env.KASPA_NOWNODES_API_KEY : undefined };
  }

  const restBaseUrl = network === "mainnet" ? env.KASPA_MAINNET_REST_URL_PUBLIC : env.KASPA_TESTNET_REST_URL_PUBLIC;
  return { key: "public", restBaseUrl };
}
