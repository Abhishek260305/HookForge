# GraphQL gateway

gqlgen gateway that proxies project queries/mutations to `control-plane-svc`.

```bash
export CONTROL_PLANE_URL=http://localhost:8081
go run ./cmd/server
```

- GraphQL: `POST http://localhost:8080/graphql`
- Playground: `http://localhost:8080/`
- Health: `GET http://localhost:8080/healthz`

```bash
# regenerate after schema changes
go run github.com/99designs/gqlgen generate
```
