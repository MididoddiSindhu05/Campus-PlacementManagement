# Deployment playbook

Deploy the API and SPA independently (two GitHub repos or mono-repo workflows both work).

## PostgreSQL

1. Provision a managed PostgreSQL database in the geography closest to your API host.
2. Create a database and an application user with access to it.
3. Allow network access from the API host, preferably using the provider's static egress addresses.

Set `DATABASE_URL` to the provider's direct PostgreSQL connection string:

```
postgresql://USER:PASSWORD@HOST:5432/placementPortal?sslmode=require
```

---

## Backend (Render or Railway)

1. **Root**: `server/`
2. **Build**: `npm install`
3. **Start**: `npm start`
4. **Environment**:

| Key | Meaning |
| --- | ------- |
| `DATABASE_URL` | Direct PostgreSQL connection string |
| `JWT_SECRET` | ≥32-byte random secret |
| `CLIENT_URL` | Comma-separated web origins (`https://app.vercel.app,http://localhost:5173`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First-run administrator seed |

5. Persist `uploads/` by mounting disk (Render Persistent Disk `/opt/render/project/src/server/uploads`).
6. Expose HTTPS only; TLS terminates at platform LB.

Smoke test: `GET https://<host>/api/health`.

---

## Frontend (Vercel)

1. **Root Directory**: `client/`
2. **Build**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment**: `VITE_API_URL=https://<render-host>`
5. `vercel.json` already rewires SPA fallback.

After deploy verify network tab confirms API hits remote origin (not blank base URL).

---

## Email (optional Gmail / SES / Ethereal)

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Without SMTP, password reset mails log to stdout + dev toast still functions.

---

## Production hardening checklist

1. Rotate `ADMIN_PASSWORD` post bootstrap.
2. Enable PostgreSQL audit logging + backup snapshots.
3. Tune `RATE_LIMIT_MAX` downward if abusive traffic observed.
4. Consider Cloudflare WAF in front.
5. Separate secrets per environment (`preview` vs `production` namespaces).
