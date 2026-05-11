## College Placement Management Portal

Production-minded MERN application that models end-to-end campus recruitment operations: recruiter master data, drive publishing with eligibility compilers, guarded applications (duplicate prevention enforced at MongoDB index level), interviewing, analytics, artefacts, notifications, CSV/PDF exports, and differentiated staff roles (`admin`, `placement_officer`, `student`).

### Highlights

| Domain | Detail |
| ------ | ------ |
| API design | Modular controllers, Joi-free validation via **express-validator**, unified response envelope, reusable pagination helpers |
| Auth | bcrypt-hashed passwords, JWT access tokens, RBAC middleware, bootstrap admin via env secrets |
| Data model | Dedicated collections for Users, Students, Companies, PlacementDrives, Applications, Notifications, Interviews, Reports |
| Placement logic | Composite eligibility evaluator + ranking + heuristic resume scoring feeding recommendations |
| Security | helmet, sanitized queries (`express-mongo-sanitize`), CORS whitelist, centralized rate-limit, Multer safeguards |
| Experience | Responsive dual dashboards (students + placements cell) with Redux Toolkit bootstrap, Axios interceptors, Recharts summaries |

Detailed endpoint contracts live in [`docs/API.md`](docs/API.md). Hosting instructions in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

### Repo layout

```
Portal/
├── client/        # React + Vite SPA (Tailwind, RTK, RHF)
├── server/        # Express API layer
├── docs/          # API + deployment narratives
└── README.md
```

Backend tree mirrors requested architecture (`controllers`, `routes`, `models`, `middleware`, `services`, `validators`, `uploads`, `utils`, `logs`, …).

---

### Local development

Requirements: Node.js ≥ 18, npm, Atlas cluster reachable from workstation.

```powershell
cp server\.env.example server\.env       # populate secrets
cp client\.env.example client\.env.local # optional; leave blank to use proxy
cd server && npm install && npm run dev # http://localhost:5000
cd ../client && npm install && npm run dev
```

Vite proxies `/api` + `/uploads` to `:5000` when `VITE_API_URL` is unset.

Administrator auto-seeds whenever `ADMIN_EMAIL` / `ADMIN_PASSWORD` references a user absent in Mongo (`server.js`). Manual alternative: `cd server && npm run seed`.

---

### Student workflows

1. Self-service registration persists both `users` & `students` snapshots.
2. Résumés upload behind Multer validations (MIME + ≤5 MB).
3. `GET /students/drives/eligible` computes per-drive reasons preventing front-end spoofing.
4. `recommended` cohort blends eligibility + weighted skill overlaps.
5. Applications route through transactional duplicate guard `{ student, placementDrive }` compound unique index.

### Staff workflows

1. Maintain companies → publish drives embedding salary bands, departmental filters, backlog caps, sequential hiring rounds JSON.
2. Applications console updates lifecycle (`pending → shortlisted/offered`).
3. Interviews enqueue admit downloads + transactional notifications (`nodemailer` optional SMTP).
4. Analytics aggregate placement funnel + department deltas + historical application velocity charts.
5. PDF summary export via pdfkit streamed to admins with Mongo audit trail (`reports` collection).

---

### Testing ideas (post-MVP automation)

Add Jest/Vitest for services (`eligibility`, `resumeScore`) + Supertest suites around critical routes (`/auth/register`, `/applications/drive/:id/apply`). Consider Playwright journeys for SPA smoke tests.

---

### Deployment cheatsheet

| Layer | Recommendation |
| ----- | ------------- |
| DB | MongoDB Atlas |
| API | Render or Railway (`server/` directory) |
| SPA | Vercel (`client/` directory, `npm run build`) |

See deployment doc for environment matrix and disk mounting guidance for uploads.

---

### License / contributions

Treat as educational reference implementation; adapt governance + compliance nuances for your registrar before production launch.
