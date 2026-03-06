import { FastifyInstance } from "fastify";
import { env } from "../env.js";

type PingResult = {
  ok: boolean;
  httpStatus?: number;
  message?: string;
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(t);
  }
}

async function pingRest(baseUrl: string, apiKey?: string): Promise<PingResult> {
  if (!baseUrl) return { ok: false, message: "Not configured" };
  const clean = baseUrl.replace(/\/$/, "");
  const url = `${clean}/addresses/kaspa:invalid/balance`;

  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["api-key"] = apiKey;

  try {
    const r = await fetchWithTimeout(url, { headers }, env.KASPA_STATUS_TIMEOUT_MS);
    const s = r.status;

    if (s === 401 || s === 403) return { ok: false, httpStatus: s, message: "Unauthorized (check API key)" };
    if (s < 500) return { ok: true, httpStatus: s, message: "Reachable" };
    return { ok: false, httpStatus: s, message: "Server error" };
  } catch (e: any) {
    return { ok: false, message: e?.name === "AbortError" ? "Timeout" : "Unreachable" };
  }
}

async function pingTokenIndexer(baseUrl: string, apiKey?: string): Promise<PingResult> {
  if (!baseUrl) return { ok: false, message: "Not configured" };
  const clean = baseUrl.replace(/\/$/, "");
  const url = `${clean}/health`;

  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["api-key"] = apiKey;

  try {
    const r = await fetchWithTimeout(url, { headers }, env.KASPA_STATUS_TIMEOUT_MS);
    const s = r.status;
    if (s < 500) return { ok: true, httpStatus: s, message: "Reachable" };
    return { ok: false, httpStatus: s, message: "Server error" };
  } catch (e: any) {
    return { ok: false, message: e?.name === "AbortError" ? "Timeout" : "Unreachable" };
  }
}

export async function statusRoutes(app: FastifyInstance) {
  app.get("/status", async () => {
    const kaspa = {
      mainnet: {
        nownodes: await pingRest(env.KASPA_MAINNET_REST_URL_NOWNODES, env.KASPA_NOWNODES_API_KEY),
        public: await pingRest(env.KASPA_MAINNET_REST_URL_PUBLIC),
      },
      testnet: {
        nownodes: await pingRest(env.KASPA_TESTNET_REST_URL_NOWNODES),
        public: await pingRest(env.KASPA_TESTNET_REST_URL_PUBLIC),
      },
    };

    const tokens = {
      mainnet: await pingTokenIndexer(env.TOKEN_INDEXER_MAINNET_URL, env.TOKEN_INDEXER_API_KEY),
      testnet: await pingTokenIndexer(env.TOKEN_INDEXER_TESTNET_URL, env.TOKEN_INDEXER_API_KEY),
    };

    return {
      api: { ok: true },
      kaspa,
      tokens,
      thresholds: {
        confirmations: env.KASPA_CONFIRMATIONS,
      },
      mocking: {
        kaspa: env.KASPA_MOCK_FALLBACK,
        token: env.TOKEN_MOCK_FALLBACK,
      },
    };
  });
}
