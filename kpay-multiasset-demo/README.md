# KPay Multi-Asset Commerce Demo (Kaspa + Tokens)

This repo is a **contest-ready demo** showcasing **multi-asset commerce on Kaspa**:

- **Network switch**: TN-10 Testnet ↔ Mainnet
- **Provider switch**: Public/Custom REST ↔ NOWNodes REST
- **Asset switch**: **KAS** (native) + **stablecoin/token placeholders** (indexer-backed or mocked)
- **Invoice lifecycle**: `PENDING → SEEN → CONFIRMED → EXPIRED`
- **Status panel**: live reachability for Kaspa REST providers + token indexer

> Notes
> - Token/stablecoin detection is **indexer-driven** (optional). If an indexer is not configured, the demo can progress using **mock fallback**.

---

## Quick start (Docker Compose)

1) Copy env template

```bash
cp .env.example .env
```

2) Start the stack

```bash
./dev up
```

3) Open

- Web: http://localhost:3000
- API: http://localhost:8080

---

## GitHub Codespaces / VS Code Dev Containers

This repo includes `.devcontainer/devcontainer.json` for **GitHub Codespaces** and the **VS Code Dev Containers** extension.

- Create a Codespace (or open in Dev Container)
- It will start the docker-compose stack
- Ports 3000 / 8080 are forwarded automatically

---

## Integrations & switching

### 1) Kaspa REST providers

Configured via `.env`:

- **NOWNodes**
  - `KASPA_MAINNET_REST_URL_NOWNODES`
  - `KASPA_NOWNODES_API_KEY`
- **Public / custom REST**
  - `KASPA_MAINNET_REST_URL_PUBLIC`
  - `KASPA_TESTNET_REST_URL_PUBLIC`

In the UI header:

- Switch **Network** (Testnet ↔ Mainnet)
- Switch **Provider** (Public ↔ NOWNodes)

Each invoice stores the provider used at creation (`providerKey`) so polling stays consistent.

### 2) Token / stablecoin indexer (optional)

If you have a token indexer, set:

- `TOKEN_INDEXER_MAINNET_URL`
- `TOKEN_INDEXER_TESTNET_URL`
- `TOKEN_INDEXER_API_KEY` (optional)

Expected endpoint pattern:

- `GET {BASE}/transfers?address=...&token=...`

Health (optional):

- `GET {BASE}/health`

If you do **not** set an indexer, token invoices can still advance using mock fallback.

---

## Demo flow

1. Choose **Asset** in the header (KAS / USDK / KRC20)
2. Choose **Network** and **Provider** in the header
3. Create an invoice
4. Watch the status change via polling

---

## Project structure

- `apps/api` – Fastify API + Prisma + poller
- `apps/web` – Next.js web app
- `docker-compose.yml` – dev stack

---

## License

MIT
