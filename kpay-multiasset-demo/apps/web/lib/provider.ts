export type ProviderKey = "public" | "nownodes";
const STORAGE_KEY = "kpay_provider";

export function getDefaultProvider(): ProviderKey {
  const envDefault = (process.env.NEXT_PUBLIC_DEFAULT_PROVIDER || "public").toLowerCase();
  return envDefault === "nownodes" ? "nownodes" : "public";
}

export function getStoredProvider(): ProviderKey {
  if (typeof window === "undefined") return getDefaultProvider();
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "nownodes" ? "nownodes" : "public";
}

export function setStoredProvider(p: ProviderKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, p);
}
