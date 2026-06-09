# ADR-001: Prometheus scrape targets use host.docker.internal

Status: Accepted

## Context

Prometheus runs in Docker and scrapes app services. During development app services run on the host machine, so Prometheus must use `host.docker.internal` to reach them. In production all services share the same Docker network and are reachable by service name.

## Decision

Maintain two Prometheus config files:

- `monitoring/prometheus.yml` — production, uses Docker service names (`api-gateway:3000`)
- `monitoring/prometheus.dev.yml` — development, uses `host.docker.internal`

`docker-compose.yml` mounts `prometheus.dev.yml` directly. No override file needed — Docker Compose is only used locally, so the dev config is always the right one for compose.

## Alternatives considered

- **`network_mode: host`** — lets Prometheus use `localhost`, but only works on Linux, not macOS/Docker Desktop.
