export type AssetKey = "KAS" | "USDK" | "KRC20_DEMO";

export type AssetConfig = {
  key: AssetKey;
  symbol: string;
  name: string;
  decimals: number;
  type: "native" | "token";
};

export const ASSETS: AssetConfig[] = [
  { key: "KAS", symbol: "KAS", name: "Kaspa", decimals: 8, type: "native" },
  { key: "USDK", symbol: "USDK", name: "USD Kaspa Stable (demo)", decimals: 2, type: "token" },
  { key: "KRC20_DEMO", symbol: "KRC20", name: "KRC-20 Demo Token", decimals: 2, type: "token" },
];

const STORAGE_KEY = "kpay_asset";

export function getDefaultAsset(): AssetKey {
  const envDefault = (process.env.NEXT_PUBLIC_DEFAULT_ASSET || "KAS").toUpperCase();
  if (envDefault === "USDK") return "USDK";
  if (envDefault === "KRC20_DEMO" || envDefault === "KRC20") return "KRC20_DEMO";
  return "KAS";
}

export function getStoredAsset(): AssetKey {
  if (typeof window === "undefined") return getDefaultAsset();
  const v = (window.localStorage.getItem(STORAGE_KEY) || "").toUpperCase();
  if (v === "USDK") return "USDK";
  if (v === "KRC20_DEMO" || v === "KRC20") return "KRC20_DEMO";
  return "KAS";
}

export function setStoredAsset(a: AssetKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, a);
}

export function getAssetConfig(key: AssetKey) {
  return ASSETS.find((a) => a.key === key) || ASSETS[0];
}
