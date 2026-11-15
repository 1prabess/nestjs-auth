# NestJS Auth

A production-oriented authentication service built with NestJS 12, demonstrating how to build secure token-based auth without the shortcuts that quietly break security.

Short-lived JWT access tokens are paired with server-side sessions and rotating refresh tokens, so sessions can be revoked, inspected, and invalidated server-side.

## What it does

| Endpoint | Purpose |
| --- | --- |
| `POST /api/auth/register` | Create an account with an Argon2id-hashed password |
| `POST /api/auth/login` | Start a session, returning an access token and a refresh token |
| `POST /api/auth/refresh` | Rotate the refresh token and issue a new access token |
| `POST /api/auth/logout` | Revoke the current session and all of its refresh tokens |
| `GET /api/auth/me` | Return the authenticated user |
| `GET /api/health/live` | Liveness probe |
| `GET /api/health/ready` | Readiness probe (checks database connectivity) |

Interactive documentation is served at `/docs` via Swagger.

## Security design

**Argon2id, not bcrypt.** Passwords are hashed with Argon2id using the OWASP-recommended parameters (`memoryCost: 19456`, `timeCost: 2`, `parallelism: 1`). Argon2id is memory-hard, so it resists GPU cracking and side-channel attacks far better than bcrypt, which is CPU-bound and only designed to be slow on the CPU it was calibrated for.

**Dummy hash verification prevents user enumeration.** When a login attempt references an account that does not exist, the service still performs a real Argon2 verification against a dummy hash before rejecting the request. Without this, "unknown email" would return noticeably faster than "wrong password", leaking which addresses have accounts through response timing.

**Refresh tokens are opaque and hashed at rest.** A refresh token is 32 random bytes from `crypto.randomBytes`, and only its SHA-256 hash is stored. A database leak therefore exposes no usable credentials, and the server never has to hold a token it could replay.

**Tokens rotate on every use.** Each refresh issues a new token and marks the old one used, revoked, and linked to its replacement. The rotation runs inside a transaction with a `pessimistic_write` row lock, so two concurrent refreshes with the same token can never both succeed.

**Reuse is treated as theft.** Presenting an already-used refresh token means the token was captured and replayed. The service revokes the entire session and every token in it, immediately cutting off the attacker and the legitimate user alike. That is the intended trade-off: forcing re-authentication is recoverable, continuing to serve a compromised session is not.

**Access tokens are bound to their session.** The session id is embedded in the access token payload and checked on every authenticated request. Revoking a session invalidates its access tokens immediately instead of leaving them usable until the JWT expires.

**Logout revokes the session and its refresh tokens.** Scoped to the authenticated user and idempotent, so a repeated logout is a no-op rather than an error.

**Sessions record client context.** Each session stores the user agent and IP address, and is bounded by an absolute lifetime separate from the refresh token lifetime.

## Architecture

```
src/
├── auth/            # controller, service, strategies, guards, entities
├── users/           # user entity and service
├── health/          # liveness and readiness probes
├── common/          # decorators and shared utilities
├── configs/         # typed, validated configuration
└── database/        # TypeORM data source and migrations
```

Configuration is registered through `@nestjs/config` with a Zod schema, so a missing or malformed environment variable fails at boot rather than at the first request. Durations are parsed centrally rather than coerced with `Number()`, which would silently produce `NaN` for values like `7d`.

## Running locally

```bash
npm install
cp .env.example .env    # then add JWT_ACCESS_SECRET (32+ chars)
docker compose up -d    # postgres
npm run migration:run
npm run start:dev
```

| Script | Purpose |
| --- | --- |
| `npm run start:dev` | Watch mode |
| `npm run build` | Production build |
| `npm run start:prod` | Run the compiled build |
| `npm run lint` | Type-aware linting |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests |
| `npm run migration:run` | Apply database migrations |

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Access token signing key, minimum 32 characters |
| `JWT_ACCESS_TTL` | Access token lifetime, e.g. `15m` |
| `REFRESH_TTL` | Refresh token lifetime, e.g. `7d` |
| `SESSION_ABSOLUTE_TTL` | Maximum session lifetime, e.g. `30d` |

## Stack

NestJS 12 · TypeScript 6 · Passport · TypeORM · PostgreSQL · Argon2 · Zod · class-validator · Swagger · Vitest
