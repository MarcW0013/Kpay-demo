"use client";

import { useEffect, useMemo, useState } from "react";
import { getStoredNetwork, type NetworkKey } from "../lib/network";
import { getStoredProvider, type ProviderKey } from "../lib/provider";

type Ping = {
  ok: boolean;
  httpStatus?: number;
  message?: string;
};

type StatusResponse = {
  api: { ok: boolean };
  kaspa: {
    mainnet: { nownodes: Ping; public: Ping };
    testnet: { nownodes: Ping; public: Ping };
  };
  tokens: {
    mainnet: Ping;
    testnet: Ping;
  };
  thresholds: { confirmations: number };
  mocking: { kaspa: boolean; token: boolean };
};

function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        ok ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
      }`}
    >
      {label}
    </span>
  );
}

export function NetworkStatusPanel() {
  const [network, setNetwork] = useState<NetworkKey>("testnet");
  const [provider, setProvider] = useState<ProviderKey>("public");
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  async function load() {
    setError(null);
    try {
      const r = await fetch(`${apiBase}/status`, { cache: "no-store" });
      if (!r.ok) throw new Error(`Status failed (${r.status})`);
      setData(await r.json());
    } catch (e: any) {
      setError(e?.message || "Status unavailable");
      setData(null);
    }
  }

  useEffect(() => {
    const sync = () => {
      setNetwork(getStoredNetwork());
      setProvider(getStoredProvider());
    };
    sync();
    load();
    const t = setInterval(load, 5000);
    window.addEventListener("kpay:network", sync);
    window.addEventListener("kpay:provider", sync);
    return () => {
      clearInterval(t);
      window.removeEventListener("kpay:network", sync);
      window.removeEventListener("kpay:provider", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedKaspa = useMemo(() => {
    const net = network === "mainnet" ? data?.kaspa.mainnet : data?.kaspa.testnet;
    if (!net) return null;
    return provider === "nownodes" ? net.nownodes : net.public;
  }, [network, provider, data]);

  const selectedToken = useMemo(() => (network === "mainnet" ? data?.tokens.mainnet : data?.tokens.testnet), [network, data]);

  return (
    <div className="border-b bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Pill ok={true} label="API: OK" />
          <span className="text-xs text-neutral-600">Selected:</span>
          <span className="text-xs font-semibold">{network === "mainnet" ? "Mainnet" : "TN-10 Testnet"}</span>
          <span className="text-xs text-neutral-600">•</span>
          <span className="text-xs font-semibold">{provider === "nownodes" ? "NOWNodes" : "Public"}</span>

          {selectedKaspa && (
            <>
              <span className="text-xs text-neutral-600">Kaspa REST:</span>
              <Pill ok={!!selectedKaspa.ok} label={selectedKaspa.ok ? "OK" : selectedKaspa.message || "Issue"} />
            </>
          )}

          {selectedToken && (
            <>
              <span className="text-xs text-neutral-600">Token indexer:</span>
              <Pill ok={!!selectedToken.ok} label={selectedToken.ok ? "OK" : selectedToken.message || "Issue"} />
            </>
          )}

          {data && (
            <span className="text-[11px] text-neutral-500">
              Conf threshold: {data.thresholds.confirmations} • Mock: kaspa={String(data.mocking.kaspa)} token={String(data.mocking.token)}
            </span>
          )}
          {error && <span className="text-[11px] text-rose-700">{error}</span>}
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <div className="text-[11px] text-neutral-600 flex items-center gap-2">
              <span>TN-10:</span>
              <Pill ok={data.kaspa.testnet.public.ok || data.kaspa.testnet.nownodes.ok} label={(data.kaspa.testnet.public.ok || data.kaspa.testnet.nownodes.ok) ? "OK" : "Down"} />
              <span>Mainnet:</span>
              <Pill ok={data.kaspa.mainnet.public.ok || data.kaspa.mainnet.nownodes.ok} label={(data.kaspa.mainnet.public.ok || data.kaspa.mainnet.nownodes.ok) ? "OK" : "Down"} />
            </div>
          )}
          <button onClick={load} className="rounded-xl border bg-white px-3 py-1.5 text-xs hover:bg-neutral-100">
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
