# Local Docker Compose stack

Runs Postgres, Redis, and the blank Go service stubs.

```bash
# from repo root
docker compose -f deploy/compose/docker-compose.yml up --build
```

| Service | Port |
|---------|------|
| graphql-gateway | http://localhost:8080 |
| control-plane-svc | http://localhost:8081 |
| postgres | localhost:5432 |
| redis | localhost:6379 |

Health checks:

```bash
curl -s localhost:8080/healthz
curl -s localhost:8081/healthz
```

No Kubernetes / kubectl required for this stack.
