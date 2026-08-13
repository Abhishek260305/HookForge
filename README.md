# Hookforge

Durable event workflows for webhook-native products.

Ingest events, run versioned DAG workflows (retries, delays, wait-signals, compensations), and deliver signed HTTP webhooks — with run timelines, DLQ, and replay.

Inspired by Temporal / Inngest (durable execution) and Svix / Hookdeck (webhook delivery).

> Status: UI + projects vertical slice (gateway ↔ control-plane ↔ Postgres). Start Compose for local data plane.

## Features (v1)

### Control plane
- Organizations → projects → environments (`dev` / `prod`)
- Environment-scoped API keys (hashed, rotatable)
- Roles: owner / admin / member
- Per-tenant quotas (events/day, max sleep, fan-out width, concurrent runs)
- Audit log for publish, key rotation, and replay

### Event ingest
- Authenticated ingest API
- Event `type` + JSON payload + optional idempotency key
- Duplicate keys return the original event/run
- Payload size limits; secret redaction in logs/UI
- Append-only event log (Postgres)

### Workflow engine
- Step editor + JSON definition
- DAG steps via `depends_on` (parallel where possible)
- Step types:
  - `http_request`
  - `delay`
  - `fan_out`
  - `wait_for_event`
  - `compensate`
- Immutable workflow versions (runs pin a version)
- Per-step retry policy (max attempts, exponential backoff, jitter)
- Run states: `queued` → `running` → `waiting` → `completed` | `failed` | `dead`

### Delivery & reliability
- Transactional outbox → queue
- At-least-once workers; unique `(run_id, step_id, attempt)`
- Per-tenant concurrency limits
- Dead-letter queue + replay
- Stuck-run reaper
- Outbound HMAC signing
- SSRF guards on user-provided URLs

### Dashboard
- Success rate, p95 latency, DLQ depth
- Filtered run list + per-run timeline
- Live updates (SSE)
- Named outbound endpoints
- Starter templates (payment wait/fan-out, GitHub-style hooks, webhook portal)

### Security & observability
- TLS, hashed keys, SSRF protection, HMAC, log redaction
- Structured logs + OpenTelemetry (ingest → worker → HTTP)
- Metrics: success/fail, queue lag, DLQ depth

## Out of scope (v1)

- Full Temporal parity (multi-language SDKs, continue-as-new, etc.)
- Full BPMN visual designer
- Arbitrary user code execution
- Multi-region active-active
- Enterprise SSO/SAML
- Exactly-once side effects at destinations (at-least-once + idempotency keys)

## Architecture

```text
                         ┌─────────────────────┐
  Browser ──────────────►│  Next.js (single FE) │  Auth.js · App Router
                         └──────────┬──────────┘
                                    │ GraphQL / SSE
                                    ▼
                         ┌─────────────────────┐
                         │  GraphQL Gateway    │  aggregates BE services
                         └──────────┬──────────┘
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
       identity-svc           control-plane-svc      query-svc
       (users/orgs)           (projects/keys/        (reads/timelines)
                              workflows)
              │                     │                     │
              └──────────┬──────────┴──────────┬──────────┘
                         ▼                     ▼
                   ingest-svc            (gRPC / events)
                   REST webhooks               │
                         │                     ▼
                         └──────────►  Kafka / Redis
                                         │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    worker-orchestrator  delivery-svc  scheduler-svc
```

- **Frontend:** single Next.js app (App Router)
- **Backend:** Go microservices behind a GraphQL gateway; public ingest over REST; internal gRPC + Kafka

## Backend services (Go)

| Service | Responsibility | Protocols |
|---------|----------------|-----------|
| `graphql-gateway` | Dashboard entrypoint; composes other services | GraphQL, SSE |
| `identity-svc` | Users, orgs, membership | gRPC |
| `control-plane-svc` | Projects, API keys, workflow definitions/versions | gRPC |
| `ingest-svc` | Event intake, idempotency, outbox | REST (+ gRPC internal) |
| `query-svc` | Run/timeline/DLQ reads | gRPC |
| `worker-orchestrator` | DAG execution state machine | Kafka consumer, gRPC |
| `delivery-svc` | Signed HTTP delivery, retries, attempts | Kafka consumer |
| `scheduler-svc` | Delays, wait timeouts, reaper, cron | internal |

**Data:** shared PostgreSQL with per-domain schemas (e.g. `identity`, `control`, `ingest`, `runs`). Redis and Kafka/Redpanda as shared infrastructure.

## Frontend

Single Next.js application:

- Auth.js in-app (GitHub OIDC; optional Google)
- Talks to the **GraphQL gateway** only (no browser → microservice fan-out)
- Tailwind CSS + shadcn/ui
- Feature folders (`runs`, `workflows`, `settings`, …)

## Stack

### Application
| Layer | Choice |
|-------|--------|
| Web | Next.js |
| Backend | Go microservices |
| UI API | GraphQL gateway (gqlgen) |
| Public ingest | REST (`ingest-svc`) |
| Internal RPC | gRPC |
| DB | PostgreSQL (shared DB + schemas) |
| Cache / locks / pubsub | Redis |
| Streaming | Kafka (Redpanda in Compose) |
| Scheduling | `scheduler-svc` |
| UI kit | Tailwind CSS + shadcn/ui |
| FE GraphQL client | GraphQL Code Generator |
| Tooling | Make (`proto`, `gql-gen`, …) |

### Platform & deploy
| Layer | Choice |
|-------|--------|
| Local | Docker Compose |
| CI | GitHub Actions |
| Images | GHCR |
| Frontend host | Vercel |
| Backend / data host | Oracle Cloud Always Free (Compose on ARM VM); Hetzner (or similar) as fallback |
| Orchestration (optional) | Kubernetes + Helm charts in-repo; Istio as a supported mesh target |

### Auth, data, ops
| Concern | Choice |
|---------|--------|
| Dashboard auth | Auth.js → JWT validated at the gateway |
| Ingest auth | Project API keys (hashed, env-scoped) |
| Migrations | Goose |
| Observability | OpenTelemetry → Prometheus, Grafana, Jaeger |
| Secrets | `.env` locally; K8s Secrets / cloud secret managers when clustered |
| License | [MIT](./LICENSE) |

### Protocols
- **GraphQL** — browser → gateway  
- **REST** — ingest / signals  
- **gRPC** — service ↔ service  
- **Kafka** — async handoff (ingest → orchestrator → delivery)

## Roadmap

1. Core services + Next.js dashboard + Compose + CI  
2. Public deploy: Vercel (web) + Oracle Always Free (API/data plane)  
3. Expand service split, Helm/K8s docs, optional Istio  
4. Managed Kubernetes (e.g. EKS) only if/when scale requires it  

## API sketch

```http
POST /v1/projects
POST /v1/projects/:id/workflows
POST /v1/projects/:id/workflows/:id/publish
POST /v1/ingest
POST /v1/signals
GET  /v1/runs/:id
POST /v1/runs/:id/replay
GET  /v1/projects/:id/runs
GET  /v1/projects/:id/dlq
POST /v1/projects/:id/dlq/:id/retry
```

## Example workflow

```json
{
  "name": "payment-to-partners",
  "trigger": { "type": "event", "event": "payment.created" },
  "steps": [
    {
      "id": "reserve",
      "type": "http_request",
      "method": "POST",
      "url": "https://api.example.com/reserve",
      "retries": { "max": 5, "backoff": "exponential" },
      "compensate": {
        "type": "http_request",
        "method": "POST",
        "url": "https://api.example.com/release"
      }
    },
    {
      "id": "await_paid",
      "type": "wait_for_event",
      "event": "payment.succeeded",
      "timeout_seconds": 3600,
      "depends_on": ["reserve"]
    },
    {
      "id": "notify_partners",
      "type": "fan_out",
      "destination_ids": ["partner_a", "partner_b"],
      "depends_on": ["await_paid"],
      "retries": { "max": 8, "backoff": "exponential" }
    }
  ]
}
```

## Repository layout (planned)

```text
hookforge/
  apps/web
  services/graphql-gateway
  services/identity-svc
  services/control-plane-svc
  services/ingest-svc
  services/query-svc
  services/worker-orchestrator
  services/delivery-svc
  services/scheduler-svc
  packages/proto
  packages/shared-go
  deploy/helm
  deploy/compose
  migrations/
  README.md
  LICENSE
```

## License

[MIT](./LICENSE)
