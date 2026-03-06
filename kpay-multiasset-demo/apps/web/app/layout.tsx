import "./globals.css";
import Link from "next/link";
import { NetworkToggle } from "../components/NetworkToggle";
import { ProviderToggle } from "../components/ProviderToggle";
import { AssetSelect } from "../components/AssetSelect";
import { NetworkStatusPanel } from "../components/NetworkStatusPanel";

export const metadata = {
  title: "KPay Multi-Asset Commerce Demo",
  description: "Kaspa + stablecoin + token payments demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center justify-between">
                <Link href="/" className="font-semibold">
                  KPay
                </Link>
                <div className="sm:hidden flex items-center gap-2">
                  <AssetSelect />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <AssetSelect />
                <NetworkToggle />
                <ProviderToggle />
                <nav className="flex gap-4 text-sm">
                  <Link href="/" className="hover:underline">
                    Dashboard
                  </Link>
                  <Link href="/invoices/new" className="hover:underline">
                    Create Invoice
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <NetworkStatusPanel />

          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

          <footer className="mx-auto max-w-5xl px-4 py-10 text-xs text-neutral-500">
            Multi-asset demo • Network + provider switching • Mock fallback supported
          </footer>
        </div>
      </body>
    </html>
  );
}
