"use client";
import { useEffect, useState } from "react";
import { getStoredProvider, setStoredProvider, type ProviderKey } from "../lib/provider";

export function ProviderToggle() {
  const [provider, setProvider] = useState<ProviderKey>("public");

  useEffect(() => {
    setProvider(getStoredProvider());
  }, []);

  function set(p: ProviderKey) {
    setProvider(p);
    setStoredProvider(p);
    // Trigger soft refresh for pages relying on fetch headers
    window.dispatchEvent(new Event("kpay:provider"));
  }

  return (
    <div className="flex items-center rounded-xl border p-1 text-xs">
      <button
        type="button"
        onClick={() => set("public")}
        className={`px-3 py-1 rounded-lg ${provider === "public" ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
        title="Use public/custom REST provider"
      >
        Public
      </button>
      <button
        type="button"
        onClick={() => set("nownodes")}
        className={`px-3 py-1 rounded-lg ${provider === "nownodes" ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
        title="Use NOWNodes REST provider"
      >
        NOWNodes
      </button>
    </div>
  );
}
