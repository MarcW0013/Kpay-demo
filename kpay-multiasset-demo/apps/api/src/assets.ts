export type AssetKey = "KAS" | "USDK" | "KRC20_DEMO";
export type AssetType = "native" | "token";

export type AssetConfig = {
  key: AssetKey;
  symbol: string;
  name: string;
  type: AssetType;
  decimals: number;
  // For tokens, an identifier understood by the configured indexer (ticker/contract/id)
  tokenId?: string;
};

export const ASSETS: Record<AssetKey, AssetConfig> = {
  KAS: { key: "KAS", symbol: "KAS", name: "Kaspa", type: "native", decimals: 8 },
  // Stablecoin placeholder (configure tokenId to match your indexer)
  USDK: { key: "USDK", symbol: "USDK", name: "USD Kaspa Stable (demo)", type: "token", decimals: 2, tokenId: "USDK" },
  // Generic token placeholder for demos
  KRC20_DEMO: { key: "KRC20_DEMO", symbol: "KRC20", name: "KRC-20 Demo Token", type: "token", decimals: 2, tokenId: "KRC20" },
};

export function normalizeAssetKey(input?: string): AssetKey {
  const v = (input ?? "").toUpperCase();
  if (v === "USDK") return "USDK";
  if (v === "KRC20_DEMO" || v === "KRC20") return "KRC20_DEMO";
  return "KAS";
}
