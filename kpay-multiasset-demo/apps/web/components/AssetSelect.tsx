"use client";
import { useEffect, useState } from "react";
import { ASSETS, getStoredAsset, setStoredAsset, type AssetKey } from "../lib/assets";

export function AssetSelect() {
  const [asset, setAsset] = useState<AssetKey>("KAS");

  useEffect(() => {
    setAsset(getStoredAsset());
  }, []);

  function onChange(v: string) {
    const key = (v as AssetKey) || "KAS";
    setAsset(key);
    setStoredAsset(key);
    window.dispatchEvent(new Event("kpay:asset"));
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-600 hidden sm:inline">Asset</span>
      <select
        value={asset}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border px-3 py-2 text-xs bg-white"
        title="Select payment asset"
      >
        {ASSETS.map((a) => (
          <option key={a.key} value={a.key}>
            {a.symbol}
          </option>
        ))}
      </select>
    </div>
  );
}
