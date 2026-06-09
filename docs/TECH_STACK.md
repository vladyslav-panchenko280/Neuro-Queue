# Tech Stack

## Runtime & Framework

- **TypeScript 5.x** — type-safe across all services
- **Node.js ≥ 18** — async I/O for high-concurrency workloads
- **NestJS 10.x** — modular microservices, DI, decorators

## Messaging

- **RabbitMQ 3.13** — priority queues (`x-max-priority: 10`), dead-letter exchange, per-provider routing
- **amqplib / @golevelup/nestjs-rabbitmq** — AMQP client for producers and consumers

## Storage

- **PostgreSQL 16** — tasks, users, API keys, metrics rollups, audit log
- **TypeORM 0.3.x** — ORM + schema migrations
- **Redis 7** — rate limiting, distributed locks, response cache, circuit breaker state, worker heartbeats

## AI Providers

- **OpenAI** (`openai`) — GPT-4o, GPT-4 Turbo
- **Anthropic** (`@anthropic-ai/sdk`) — Claude models
- **Replicate** (`replicate`) — open-source model inference

## Reliability Patterns

- **Circuit Breaker** — Redis-backed `CLOSED / OPEN / HALF_OPEN`, shared across all worker replicas
- **Rate Limiting** — sliding window counter in Redis with Lua atomics
- **Distributed Lock** — Redis `SET NX EX`, prevents duplicate processing across replicas
- **Request Batching** — in-memory accumulator flushed on `maxSize` or `timeoutMs`
- **Backpressure** — queue depth polling, returns `503` with `Retry-After` above threshold
- **Dead-letter Queue** — exhausted tasks routed to `ai.dlx`, persisted to `task_failures`

## Observability

- **Prometheus** — metrics scrape from every service at `/metrics`
- **pino / nestjs-pino** — structured JSON logging with `traceId`, `taskId`, `userId`
- **@nestjs/terminus** — health checks for DB, Redis, RabbitMQ, disk at `/health`
- **@nestjs/swagger** — auto-generated OpenAPI spec at `/docs`

## Infrastructure

- **Docker Compose** — full local stack with all services and volumes
- **Docker** — per-service multi-stage Dockerfiles

## Testing

- **Jest** — unit and integration tests; TestContainers for real dependencies
- **k6** — load testing, 500 tasks/min target, p95 < 5 s

## Auth

- **API key** via `X-API-Key` header, stored as SHA-256 hash in PostgreSQL
- Validated against Redis on each request
- Tiers: `free / pro / enterprise` with per-tier rate limits
