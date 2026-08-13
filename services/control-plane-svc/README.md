# control-plane-svc

Owns projects (and later API keys / workflow definitions).

## Run locally

```bash
# Postgres must be up (Compose infra)
make be-infra
make migrate

export DATABASE_URL=postgres://hookforge:hookforge@localhost:5432/hookforge?sslmode=disable
go run ./cmd/server
```

- `GET /healthz`
- `GET /readyz`
- `GET /v1/projects`
- `POST /v1/projects` — body: `{ "name", "slug", "environment": "dev"|"prod" }`
