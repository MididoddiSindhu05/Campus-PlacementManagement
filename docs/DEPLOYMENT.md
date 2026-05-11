# Deployment playbook

Deploy the API and SPA independently (two GitHub repos or mono-repo workflows both work).

## MongoDB Atlas

1. Provision an M10 (or free M0 sandbox) cluster in the geography closest to your API hosts.
2. Create database user credentials with read/write privileges on `placementPortal` (database name configurable).
3. Add `Network Access → IP Allowlist`:
   - `0.0.0.0/0` temporarily for Render/Railway dynamic egress.
   - Tighten to provider static egress when available.

Connection string placeholder:

```
mongodb+srv://USER:PASSWORD@cluster123.abcd.mongodb.net/placementPortal?retryWrites=true&w=majority
```

---

## Backend (Render or Railway)

1. **Root**: `server/`
2. **Build**: `npm install`
3. **Start**: `npm start`
4. **Environment**:

| Key | Meaning |
| --- | ------- |
| `MONGO_URI` | Atlas URI |
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
2. Enable MongoDB auditing + backup snapshots.
3. Tune `RATE_LIMIT_MAX` downward if abusive traffic observed.
4. Consider Cloudflare WAF in front.
5. Separate secrets per environment (`preview` vs `production` namespaces).
