# NeuroQueue

**A distributed task queue for AI workloads** — route prompts to OpenAI, Anthropic, or Replicate with priority scheduling, automatic retries, rate limiting, and full observability. Built as a production-grade backend portfolio project.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-green)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-red)](https://nestjs.com)

---

## Why it exists

Direct calls to AI APIs break under load — no retries, no priority, no cost control. NeuroQueue sits between your app and the providers: it queues tasks, routes them to the right worker, handles failures, and keeps costs predictable.

---

## Architecture

```
Client
  │  HTTPS / REST
  ▼
API Gateway :3000       ← auth (X-API-Key), rate limiting, validation
  │
  ▼
Task Orchestrator :3001 ← persist, prioritize, backpressure, DLQ
  │
  ▼  RabbitMQ — priority queues (high=9 / medium=5 / low=1) + DLX
  ├── OpenAI Worker :3002
  ├── Anthropic Worker :3003
  └── Replicate Worker :3004
         │
         ▼
  PostgreSQL · Redis · Prometheus :9090
```

---

## Quick start

**Prerequisites:** Node.js ≥ 18, pnpm ≥ 10, Docker Desktop

```bash
# 1. Clone and install
git clone https://github.com/vladyslav-panchenko280/NeuroQueue.git
cd NeuroQueue
pnpm install

# 2. Configure environment
cp .env.example .env   

# 3. Start infrastructure
pnpm run infra:up 

cd services/api-gateway     && pnpm run start:dev
cd services/task-orchestrator && pnpm run start:dev
cd services/workers/openai  && pnpm run start:dev
```

**Useful URLs:**
- API → http://localhost:3000
- RabbitMQ UI → http://localhost:15672 (`app` / `app_dev_password`)
- Prometheus → http://localhost:9090

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/tasks` | ✓ | Submit an AI task |
| `GET` | `/tasks/:id` | ✓ | Poll task status |
| `GET` | `/tasks/:id/result` | ✓ | Retrieve completed result |
| `DELETE` | `/tasks/:id` | ✓ | Cancel a pending task |
| `GET` | `/health` | — | Liveness probe |
| `GET` | `/metrics` | — | Prometheus metrics |
| `GET` | `/docs` | — | Swagger UI (dev only) |

**Submit task payload:**
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "priority": "high",
  "prompt": "Summarize this text",
  "parameters": { "max_tokens": 512, "temperature": 0.7 }
}
```

---

## Documentation

- [Tech stack](docs/TECH_STACK.md)
- [Contributing & branch conventions](docs/CONTRIBUTING.md)
- [Commit message format](docs/CONVENTIONAL_COMMITS.md)
- [ADR-001 — Prometheus dev config](docs/ADR/001-prometheus-dev-prod-config.md)
