# Relay

**Durable event workflows for webhook-native products.**

Relay is a multi-tenant platform where teams ingest events, run versioned DAG workflows with retries/delays/compensations, and deliver signed HTTP webhooks — with a realtime run timeline, DLQ, and replay.

Inspired by Temporal / Inngest (durable execution) and Svix / Hookdeck (webhook delivery). Scoped as a shippable product, not a full Temporal clone.

---

## Problem

SaaS backends need reliable multi-step automation after events:

- Stripe/GitHub/your API fires an event
- You must call partners, wait, branch, retry, compensate
- Naive cron + queues lose events, double-send, or hide failures

Relay makes **ingest → orchestrate → deliver** a first-class product with guarantees you can see in a dashboard.

---

## Who it’s for

- Developers building webhook-heavy SaaS
- Teams that want durable workflows without operating Temporal
- Anyone who needs **retryable outbound delivery** + **run-level observability**

---

## Product pillars

1. **Ingest** — authenticated event intake with idempotency  
2. **Orchestrate** — versioned DAG workflows (not a flat JSON toy list)  
3. **Deliver** — signed HTTP with backoff, concurrency limits, DLQ  
4. **Observe** — per-run timeline, metrics, traces, replay  

---

## Core features (v1)

### Control plane
- Organizations → projects → environments (`dev` / `prod`)
- Hashed API keys, scoped by environment, with rotation
- Role-ready membership model (owner/admin/member)
- Per-tenant quotas: events/day, max sleep duration, max fan-out width, max concurrent runs
- Audit log for workflow publish, key rotation, replay actions

### Event ingest
- `POST /v1/ingest/:projectKey` (or header API key)
- Event `type` + JSON payload + optional `idempotency-key`
- Duplicate keys return the original event/run (no double-fire)
- Payload size limits; secrets redacted in UI/logs
- Append-only event log in Postgres

### Workflow engine
- Visual-ish **step editor** + raw JSON definition
- **DAG** steps with `depends_on` (parallel where possible)
- Step types (v1):
  - `http_request` — outbound HTTP call
  - `delay` — durable sleep until `next_run_at`
  - `fan_out` — deliver same payload to N URLs
  - `wait_for_event` — pause until matching signal/event or timeout
  - `compensate` — paired undo HTTP on failure path
- **Workflow versioning**: runs pin a version; publishing creates a new immutable version
- Retry policies per step: max attempts, exponential backoff, jitter
- Run state machine: `queued → running → waiting → completed | failed | dead`

### Delivery & reliability
- Transactional **outbox** from API → queue (no lost enqueue on crash)
- At-least-once workers; attempt rows uniquely constrained `(run_id, step_id, attempt)`
- Per-tenant **concurrency caps** (noisy-neighbor protection)
- Dead-letter queue for exhausted retries
- **Replay**: create a new run linked to a prior run/event
- Stuck-run reaper for workers that die mid-step
- Outbound **HMAC signing** + timestamp skew window
- **SSRF guards** on user-provided URLs (block link-local / metadata IPs)

### Dashboard
- Project overview: success rate, p95 step latency, DLQ depth
- Run list with filters (status, workflow, time)
- **Run timeline**: each step attempt, status codes, latency, errors
- Live updates (SSE) while a run is in flight
- One-click replay / retry from DLQ
- Endpoint registry for outbound webhook targets (optional named destinations)

### Templates (opinionated wedge)
- Stripe-like: payment event → wait for success signal → notify + partner webhook  
- GitHub-like: push → delay → fan-out staging/prod hooks  
- Customer webhook portal: manage endpoints + browse delivery attempts  

### Security
- TLS-only public endpoints
- Key hashing at rest
- SSRF protection on `http_request` / `fan_out`
- HMAC for outbound authenticity
- Log/UI redaction for Authorization headers and known secret fields

### Observability
- Structured logs with `project_id`, `run_id`, `step_id`
- OpenTelemetry traces: ingest → worker → HTTP step
- Basic metrics export (success/fail counters, queue lag, DLQ depth)
- Public demo status snippet for the landing page

---

## Explicitly out of scope (v1)

- Full Temporal parity (signals API surface, queries, continue-as-new, multi-language SDKs)
- BPMN / drag-everywhere graph designer
- Arbitrary user code execution (no eval sandboxes in v1)
- Multi-region active-active
- Enterprise SSO/SAML (can add later)
- Guaranteed exactly-once *side effects* at destinations (we document at-least-once + idempotency keys)

---

## Architecture (target)

```text
Browser / SaaS producers
        │
        ▼
   API (auth, validate, quotas, idempotency)
        │
        ├─► Postgres: events, workflow_versions, runs, run_steps, outbox, audit
        └─► Outbox dispatcher → Redis queue (BullMQ or equivalent)

   Workers
        ├─ workflow executor (DAG scheduler)
        ├─ HTTP delivery + retries
        └─ delay / wait_for_event scheduler

   Dashboard ◄── SSE/pubsub ── workers + API
```

**Patterns we commit to:** outbox, idempotency keys, DAG scheduling, compensations, per-tenant isolation/quotas, DLQ + replay, OTel.

---

## Suggested stack

| Layer | Choice |
|-------|--------|
| Web | Next.js |
| API + workers | TypeScript (Fastify or Nest) |
| DB | Postgres |
| Queue | Redis + BullMQ |
| Auth | Clerk or Auth.js |
| Hosting | Vercel (web) + Fly/Railway (API/workers) |
| Tracing | OpenTelemetry |

---

## Public API sketch

```http
POST /v1/projects
POST /v1/projects/:id/workflows
POST /v1/projects/:id/workflows/:id/publish
POST /v1/ingest                     # event in
POST /v1/signals                    # resume wait_for_event
GET  /v1/runs/:id                   # timeline
POST /v1/runs/:id/replay
GET  /v1/projects/:id/runs
GET  /v1/projects/:id/dlq
POST /v1/projects/:id/dlq/:id/retry
```

---

## Example workflow definition

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

---

## Demo script (what “done” looks like)

1. Create project + `prod` API key  
2. Install template “payment → wait → fan-out”  
3. Send test `payment.created`  
4. See `reserve` fail once, retry, succeed  
5. Run sits in `waiting` until `payment.succeeded` signal  
6. Fan-out delivers to two endpoints with HMAC headers  
7. Kill a worker mid-run → reaper resumes safely  
8. Replay the run from the UI  

---

## Success metrics

- Ingest p95 < 100ms excluding cold start  
- Zero silent event loss under API crash (outbox proof)  
- Documented retry/DLQ behavior with fixtures  
- Deployed public demo + short Loom walkthrough  

---

## Cost target (personal/public demo)

Roughly **$5–40/mo** at low traffic (Neon + Redis + small Fly/Railway + Vercel hobby).

---

## Repo status

Product definition only. Implementation not started.

### Planned monorepo layout

```text
relay/
  apps/web          # dashboard + marketing
  apps/api          # control plane + ingest
  apps/worker       # executors
  packages/shared   # types, workflow schema
  README.md
```

---

## Resume one-liner

> Built Relay — a multi-tenant durable workflow and webhook delivery platform with Postgres outbox, DAG orchestration (delays, wait-signals, compensations), per-tenant concurrency/quotas, signed deliveries, DLQ/replay, and OpenTelemetry.
