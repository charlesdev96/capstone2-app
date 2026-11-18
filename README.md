# GitOps Shop Application

Four Node.js/Express services: Gateway (3001), Users (3002), Orders (3003), Payments (3004). All expose `/health` and `/metrics`. Shared middleware emits JSON logs with `trace_id`, propagates `x-trace-id`, and exports Prometheus request counters and latency histograms.

## Local setup
Requires Node.js 22+.

```powershell
npm install
npm run lint
npm test
```

Run in four PowerShell terminals from the repository root:

```powershell
$env:PORT="3004"; npm run start:payments
$env:PORT="3002"; npm run start:users
$env:PORT="3003"; $env:PAYMENTS_URL="http://localhost:3004"; npm run start:orders
$env:PORT="3001"; $env:USERS_URL="http://localhost:3002"; $env:ORDERS_URL="http://localhost:3003"; npm run start:gateway
```

Test an order:

```powershell
$body = @{ user_id = "u-1001"; item = "keyboard"; amount = 45 } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3001/api/orders -Method Post -ContentType "application/json" -Headers @{ "x-trace-id" = "demo-123" } -Body $body
```

## Docker
```powershell
docker build --build-arg SERVICE=gateway -t gitops-shop-gateway:local .
docker build --build-arg SERVICE=users -t gitops-shop-users:local .
docker build --build-arg SERVICE=orders -t gitops-shop-orders:local .
docker build --build-arg SERVICE=payments -t gitops-shop-payments:local .
```

The Dockerfile is multi-stage (`builder` and `runner`); the final image contains production dependencies only and runs as the non-root `node` user.

## CI/CD
The workflow runs lint, tests and `npm audit` for pushes and pull requests. On pushes to `main`, it builds each image once locally, scans it with Trivy, pushes the scanned image to GHCR, then updates staging image tags in `gitops-shop-config`.

Add a repository secret `CONFIG_REPO_TOKEN`: a fine-grained GitHub PAT with Contents read/write access to `gitops-shop-config`. The built-in `GITHUB_TOKEN` is used for GHCR publishing. The workflow assumes both repositories are owned by the same GitHub account.
