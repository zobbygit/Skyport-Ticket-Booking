# SkyPort — Airport Management Platform (Scaffold)

A full-stack starting point implementing the core architecture from the spec:
JWT auth with separate passenger/admin realms + RBAC, PostgreSQL (Neon-ready)
schema, real-time Socket.IO updates, flight search & booking, check-in +
boarding passes, live baggage tracking, an interactive airport map, an admin
console (flights, gates, passengers, admins, audit log, announcements),
Brevo/Nodemailer email hooks, and a Cloudinary avatar pipeline.

**Scope note:** the original spec describes 60+ feature sections at full
production depth (analytics dashboards, complete notification preference
center, multi-currency pricing, seat maps, etc). This scaffold implements the
core, working path through every major system with clean, extensible
architecture — not every polish item. Everything is structured so you can
extend a module without restructuring anything.

## Structure

```
skyport/
  backend/     Express + TypeScript + PostgreSQL + Socket.IO API
  frontend/    React + TypeScript + Vite + Tailwind SPA
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: DATABASE_URL (Neon), JWT secrets, SUPER_ADMIN_EMAIL/PASSWORD,
# optionally CLOUDINARY_* and BREVO_SMTP_* (emails just log to console if unset)

npm run db:migrate   # creates all tables
npm run db:seed      # seeds super admin + demo airports/flights
npm run dev           # http://localhost:4000
```

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # defaults already point at localhost:4000
npm run dev             # http://localhost:5173
```

## 3. Log in

- Passenger: register a new account at `/register`.
- Admin: `/admin/login` using the `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
  you set in `backend/.env`, then create more admins from the Admins page.

## Notable design decisions

- **Two auth realms, two cookies.** Passenger and admin sessions use separate
  httpOnly cookies (`skyport_access`/`skyport_refresh` vs
  `skyport_admin_access`/`skyport_admin_refresh`) and separate JWT audiences,
  so one token can never be replayed against the other's routes.
- **RBAC** is enforced with `requireAdminRole(...)` middleware per-route, not
  just in the UI.
- **Real-time**: Socket.IO rooms per flight (`flight:<id>`), per airport, and
  per passenger (`passenger:<id>`) — the server emits `flight:updated`,
  `baggage:updated`, `notification:new`, `announcement:new`; the frontend
  subscribes contextually per page.
- **Audit log** captures every admin management action (create/disable admin,
  suspend passenger) with actor + metadata.
- **Cache layer** (`services/cache`) is a drop-in-Redis-shaped in-memory TTL
  cache — swap the internals only when you actually need Redis.
- **Email** is Nodemailer via Brevo SMTP; with no SMTP env vars set it logs to
  console instead of failing, so the app runs fully offline in dev.

## What to build next

The architecture supports adding, without restructuring: seat maps, fare
classes/multi-currency pricing, a notification-preferences center, richer
airport-map SVGs per terminal, PDF boarding passes / real QR codes, analytics
charts on the admin dashboard, and CI/tests.
