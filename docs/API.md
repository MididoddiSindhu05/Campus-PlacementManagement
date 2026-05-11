# Placement Portal — REST API

Base URL examples:

| Environment | Base |
| ----------- | ---- |
| Local proxy | Same origin `/api/*` via Vite dev server |
| Direct API  | `https://YOUR_RENDER_APP.onrender.com/api` |

All JSON responses follow:

```json
{ "success": true, "message": "...", "data": ... }
```

Error responses expose `422` payloads with `{ success:false, errors:[express-validator]` }`.

## Authentication

JWT bearer token obtained from login/register endpoints. Send `Authorization: Bearer <token>`.

| Method | Path | Auth | Summary |
| ------ | ---- | ---- | ------- |
| POST | `/api/auth/register` | Public | Student signup + bootstrap profile |
| POST | `/api/auth/login` | Public | Credential exchange |
| POST | `/api/auth/forgot-password` | Public | Sends reset mail if SMTP configured |
| POST | `/api/auth/reset-password` | Public | Applies new secret using emailed token hash |
| GET | `/api/auth/me` | Any | Hydrates Redux session |

Student login must include `{ "roleHint": "student" }`, staff dashboards rely on `{ "roleHint":"admin" }`.

## Student scope

Mounted at `/api/students` · requires `student` role.

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/me` | Academic + resume metadata |
| PATCH | `/me` | Mutation (skills CSV, backlog, dept, cgpa…) |
| POST | `/resume` | multipart `resume` PDF/DOC (Multer guarded) |
| GET | `/resume` | Streams stored artefact |
| GET | `/drives/eligible` | Annotates each drive with eligibility reasons |
| GET | `/drives/recommended` | Ranked cohort (`recommendationService`) |
| GET | `/applications/summary` | Applications + Mongo interview graph |

Applications issued against `/api/applications/drive/:driveId/apply` (duplicate key → `409`).

## Placement operations

`/api/companies` & `/api/drives`

- Anonymous `GET /` pagination supports `page`, `limit`, `search`, `company`, `status`.
- Writes require `placement_officer|admin`.

## Applications (staff)

`/api/applications`

| Method | Path | Roles | Notes |
| ------ | ---- | ----- | ----- |
| GET | `/` | staff | Filters (`status`,`student`,`drive`,`fraud`) |
| PATCH | `/:id` | staff | Update status (+ optional fraud flag toggle) |
| DELETE | `/:id` | `admin` | Hard delete erroneous submission |

## Administration

`/api/admin` · `admin` role only except noted.

| Endpoint | Capability |
| -------- | ----------- |
| `GET /students` | Search/filter/pagination |
| `GET /students/export/csv` | CSV snapshot |
| `PATCH /students/:id` | Manual overrides |
| `DELETE /students/:id` | Remove linked auth account |
| `POST /rankings/refresh` | Recompute `resumeScore` + `rankScore` |

## Analytics

`GET /api/analytics/dashboard` — placements funnel, departmental aggregates (`$group`), offer ceilings, trending applications.

## Notifications

Staff `POST /api/notifications` body `{title, message, audienceRole, type?, link?}`. Audience may be targeted `student|admin|placement_officer|all`. Students/mark staff read acknowledgement via `/api/notifications/:id/read`.

## Interviews & admit artefacts

Staff `POST /api/interviews/application/:applicationId`.

Students download sanitized instructions via `/api/interviews/:interviewId/admit-card` returning `text/plain` bundle referencing backend-generated token.

Listing `GET /api/interviews/application/:applicationId` is permitted to student owner or staff — controller enforces linkage.

## Reports

`GET /api/reports/placement/pdf` streams PDFKit artefact plus archives metadata in Mongo `reports` collection. `GET /api/reports` lists recent artefacts with issuer population.

## System

`GET /api/health` — lightweight uptime probe for Render/UptimeRobot.
