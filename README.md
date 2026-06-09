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
  │  HTTP
  ▼
API Gateway          ← auth, rate limiting, validation
  │
  ▼
Task Orchestrator    ← persist, prioritize, publish
  │
  ▼  RabbitMQ (priority queues + DLQ)
  ├── OpenAI Worker
  ├── Anthropic Worker
  └── Replicate Worker
         │
         ▼
  PostgreSQL · Redis · Prometheus
```

---

## Key features

- **Priority queues** — high / medium / low with native RabbitMQ priority
- **Circuit breaker** — Redis-backed, shared across all worker replicas
- **Rate limiting** — sliding window per API key and tier
- **Response cache** — SHA-256 keyed, skip duplicate AI calls
- **Request batching** — reduce provider costs by grouping concurrent tasks
- **Backpressure** — 503 with `Retry-After` when queues are saturated
- **Observability** — Prometheus metrics, structured JSON logs, health endpoints

---

## Quick start

```bash
cp .env.example .env       # add your AI provider keys
docker compose up          # starts all services
```

Submit a task:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4o","priority":"high","prompt":"Hello"}'
```

Poll status:

```bash
curl http://localhost:3000/tasks/{taskId} -H "X-API-Key: your-key"
```

---

## Tech stack

NestJS · RabbitMQ · PostgreSQL · Redis · Docker Compose · Prometheus · TypeScript

Full breakdown in [docs/TECH_STACK.md](docs/TECH_STACK.md).

---

## Documentation

- [Contributing & branch conventions](docs/CONTRIBUTING.md)
- [Commit message format](docs/CONVENTIONAL_COMMITS.md)
- [Tech stack](docs/TECH_STACK.md)
