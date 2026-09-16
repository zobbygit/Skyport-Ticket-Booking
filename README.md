<div align="center">

# ✈️ SkyPort — Airport Management Platform

**A full-stack, production-ready airport operations and passenger experience platform.**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[**Live Demo**](https://skyport-frontend.vercel.app) · [**API Docs**](#-api-reference) · [**Deploy Guide**](#-deployment)

![SkyPort Screenshot](https://via.placeholder.com/1200x600/2563eb/ffffff?text=SkyPort+Airport+Management+Platform)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Real-time Events](#-real-time-events-socketio)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Architecture Decisions](#-architecture-decisions)

---

## ✨ Features

### 👤 Passenger Features
| Feature | Description |
|---|---|
| 🔐 **Auth** | Register / login with JWT sessions + httpOnly cookies |
| 🔍 **Flight search** | Filter by origin, destination, date, airline with price sorting |
| 💳 **Stripe payments** | Secure checkout via Stripe Elements — booking stays `PENDING_PAYMENT` until webhook fires |
| 🪑 **Multi-passenger booking** | Book up to 9 passengers per booking with individual passenger details |
| 🎫 **Boarding pass** | QR-code boarding pass page + PDF emailed on check-in |
| 🧳 **Baggage tracking** | Track bags by tag reference with live status timeline |
| 🗺️ **Interactive airport map** | Leaflet world map + SVG indoor terminal map with color-coded points |
| 🌤️ **Weather widget** | Live weather at selected airport via WeatherAPI.com |
| 🔔 **Real-time notifications** | Gate changes, delays, booking confirmations pushed via Socket.IO |
| 💱 **Multi-currency** | Switch between 10 currencies with live conversion |
| 🛍️ **Add-ons** | Extra baggage, priority boarding, lounge access at checkout |
| 💰 **Refunds** | Request Stripe refund from dashboard — auto-cancels booking |
| 👤 **Profile + avatar** | Update profile, upload avatar via Cloudinary |

### 🛡️ Admin Features
| Feature | Description |
|---|---|
| 🏢 **Airport management** | Create airports, terminals, gates, and map points step-by-step |
| ✈️ **Flight management** | Create flights, update status/gate with live passenger notifications |
| 📊 **Analytics dashboard** | Recharts — bookings/revenue over 30 days, flight status breakdown, top routes |
| 👥 **Passenger management** | View, search, suspend/reactivate passenger accounts |
| 🔐 **Admin management** | Create staff accounts with role-based permissions (SUPER_ADMIN / OPERATIONS_ADMIN / FLIGHT_MANAGER) |
| 📋 **Audit log** | Every action logged — login, booking, flight change, admin action — with PDF + JSON export |
| 📢 **Announcements** | Broadcast INFO / WARNING / CRITICAL messages to passengers |
| 🔔 **Admin notifications** | Real-time bell with unread count for bookings and check-ins |

---

## 🛠️ Tech Stack

### Backend
| Tech | Purpose |
|---|---|
| **Node.js + Express** | HTTP server |
| **TypeScript** | Type safety throughout |
| **PostgreSQL (Neon)** | Primary database — serverless, auto-scaling |
| **Socket.IO** | Real-time bidirectional events |
| **Stripe SDK** | Payment intents + webhook verification |
| **Nodemailer + Brevo** | Transactional email (PDF boarding pass attachment) |
| **PDFKit** | Server-side boarding pass PDF generation |
| **Cloudinary** | Avatar image upload and CDN |
| **Zod** | Request validation |
| **JWT** | Stateless auth (separate passenger + admin audiences) |
| **Bcrypt** | Password hashing (12 rounds) |
| **Jest + Supertest** | Backend testing |

### Frontend
| Tech | Purpose |
|---|---|
| **React 18 + TypeScript** | UI framework |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling with dark/light theme system via CSS variables |
| **Zustand** | Client state (auth, theme, currency) |
| **TanStack Query** | Server state, caching, background refetch |
| **React Router v6** | Client-side routing |
| **Stripe Elements** | PCI-compliant card collection |
| **React Leaflet + OpenStreetMap** | World map (free, no API key) |
| **Recharts** | Analytics charts |
| **QRCode.React** | Client-side boarding pass QR |
| **date-fns** | Date formatting |
| **Lucide React** | Icon system |
| **React Hot Toast** | Toast notifications |
| **Vitest** | Frontend unit testing |

---

## 📁 Project Structure

```
skyport/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # PostgreSQL pool + transaction helper
│   │   │   └── env.ts             # Typed env vars
│   │   ├── db/
│   │   │   ├── schema.sql         # Full idempotent schema
│   │   │   ├── migrate.ts         # Run schema.sql against DB
│   │   │   └── seed.ts            # 13 airports, 43 flights, map points
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT extraction + audience check
│   │   │   ├── rbac.ts            # requireAdminRole(...roles)
│   │   │   ├── errorHandler.ts    # Global error + 404 handlers
│   │   │   └── rateLimiter.ts     # Global + strict limiters
│   │   ├── modules/
│   │   │   ├── auth/              # register, login (passenger+admin), refresh, logout
│   │   │   ├── users/             # profile, avatar, saved items
│   │   │   ├── flights/           # search, CRUD, status/gate updates
│   │   │   ├── bookings/          # create, check-in, cancel, multi-passenger
│   │   │   ├── payments/          # Stripe payment intents + webhook
│   │   │   ├── baggage/           # track, report, admin status update
│   │   │   ├── notifications/     # passenger + admin notifications
│   │   │   ├── airports/          # list, terminals, map points, admin CRUD
│   │   │   ├── gates/             # list, create, status update
│   │   │   ├── announcements/     # list, create (admin)
│   │   │   ├── pricing/           # currency list + USD conversion
│   │   │   ├── addons/            # catalog, add/remove booking extras
│   │   │   └── admin/             # dashboard stats, analytics, passengers, admins, audit log
│   │   ├── services/
│   │   │   ├── audit/             # Central audit logger (fire-and-forget)
│   │   │   ├── cache/             # In-memory TTL cache (Redis-shaped interface)
│   │   │   ├── cloudinary/        # Avatar upload pipeline
│   │   │   ├── email/             # Nodemailer/Brevo + HTML templates
│   │   │   ├── pdf/               # PDFKit boarding pass generator
│   │   │   ├── socket/            # Socket.IO init + realtime emit helpers
│   │   │   └── stripe/            # Stripe SDK wrapper
│   │   ├── utils/
│   │   │   ├── apiError.ts        # Typed HTTP error class
│   │   │   ├── asyncHandler.ts    # Async route wrapper
│   │   │   ├── ids.ts             # Booking ref + baggage tag generators
│   │   │   ├── jwt.ts             # Sign + verify access/refresh tokens
│   │   │   └── password.ts        # Bcrypt hash + compare
│   │   ├── __tests__/             # Jest + Supertest integration tests
│   │   ├── app.ts                 # Express app setup
│   │   └── server.ts              # HTTP + Socket.IO server
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── AdminLayout.tsx     # Admin sidebar + header
    │   │   ├── CurrencySelector.tsx
    │   │   ├── ErrorState.tsx
    │   │   ├── FlightCard.tsx
    │   │   ├── Footer.tsx          # Premium 4-column footer
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── Navbar.tsx          # Glass navbar with mobile menu
    │   │   ├── ProtectedRoute.tsx  # Passenger + admin route guards
    │   │   ├── Reveal.tsx          # Scroll-reveal IntersectionObserver wrapper
    │   │   ├── StatusBadge.tsx     # Color-coded flight/booking status pill
    │   │   ├── ThemeToggle.tsx
    │   │   └── WeatherWidget.tsx   # WeatherAPI.com live widget
    │   ├── hooks/
    │   │   └── usePrice.ts        # Currency-aware price formatter
    │   ├── lib/
    │   │   ├── api.ts             # Axios instance + interceptors
    │   │   ├── queryClient.ts     # TanStack Query client config
    │   │   └── socket.ts          # Socket.IO client init + helpers
    │   ├── pages/
    │   │   ├── Home.tsx           # Landing page with hero, destinations, FAQ
    │   │   ├── Login.tsx          # Split-screen login
    │   │   ├── Register.tsx       # Register with password strength meter
    │   │   ├── FlightSearch.tsx   # Search results with sort + filter
    │   │   ├── FlightDetails.tsx  # Flight detail + multi-passenger booking form
    │   │   ├── Checkout.tsx       # Stripe Elements checkout + add-ons
    │   │   ├── Dashboard.tsx      # Passenger trip overview with check-in/refund
    │   │   ├── BoardingPass.tsx   # QR boarding pass (multi-passenger)
    │   │   ├── Baggage.tsx        # Tag tracker + policy reference
    │   │   ├── AirportMap.tsx     # Leaflet world map + SVG indoor map
    │   │   ├── Notifications.tsx  # Passenger notification center
    │   │   ├── Profile.tsx        # Profile + avatar upload
    │   │   └── admin/
    │   │       ├── AdminLogin.tsx
    │   │       ├── AdminDashboard.tsx
    │   │       ├── AdminAnalytics.tsx  # Recharts: bookings, revenue, routes
    │   │       ├── AdminFlights.tsx    # Flight CRUD + status updates
    │   │       ├── AdminAirports.tsx   # Step-by-step airport builder
    │   │       ├── AdminGates.tsx      # Gate status management
    │   │       ├── AdminPassengers.tsx
    │   │       ├── AdminAdmins.tsx
    │   │       ├── AdminAuditLog.tsx   # Filterable log + PDF/JSON export
    │   │       └── AdminAnnouncements.tsx
    │   ├── store/
    │   │   ├── authStore.ts       # Zustand auth state + hydration
    │   │   ├── currencyStore.ts   # Selected currency + rate
    │   │   └── themeStore.ts      # Dark/light theme with localStorage persist
    │   ├── types/
    │   │   └── index.ts           # Shared TypeScript interfaces
    │   ├── __tests__/             # Vitest unit tests
    │   ├── App.tsx                # Route definitions
    │   ├── main.tsx               # Entry point
    │   └── styles/index.css       # Tailwind + CSS variable theme system
    ├── .env.example
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Stripe](https://stripe.com) account (test mode)
- A [Brevo](https://brevo.com) account for email (free tier — 300/day)

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/skyport.git
cd skyport
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env` (see [Environment Variables](#-environment-variables)), then:

```bash
npm run db:migrate   # creates all tables
npm run db:seed      # seeds 13 airports, 43 flights, map points
npm run dev          # http://localhost:4000
```

Verify it's running:
```bash
curl http://localhost:4000/health
# {"success":true,"status":"ok"}
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev          # http://localhost:5173
```

### 4. First login

| Role | URL | Credentials |
|---|---|---|
| Passenger | `/register` | Create a new account |
| Admin | `/admin/login` | `SUPER_ADMIN_EMAIL` + `SUPER_ADMIN_PASSWORD` from `.env` |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# ── Server ─────────────────────────────────────────────
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173      # Frontend URL (for CORS)

# ── PostgreSQL ─────────────────────────────────────────
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# ── JWT ────────────────────────────────────────────────
JWT_ACCESS_SECRET=change_me_long_random_string
JWT_REFRESH_SECRET=change_me_another_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECRET=change_me_cookie_secret

# ── Admin bootstrap ─────────────────────────────────────
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=StrongPassword123!
SUPER_ADMIN_NAME=SkyPort Super Admin

# ── Cloudinary (avatar uploads) ─────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Brevo SMTP (transactional email) ────────────────────
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_login@email.com   # Brevo account email
BREVO_SMTP_PASSWORD=xsmtpsib-xxxxxxxxxxxx    # Brevo SMTP key (NOT account password)
BREVO_FROM_EMAIL=no-reply@yourdomain.com
BREVO_FROM_NAME=SkyPort

# ── Stripe ─────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
STRIPE_CURRENCY=usd

# ── Rate limiting ───────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

> **Tip:** Email logs to console in dev if SMTP vars are blank — app works fully offline without them.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
VITE_WEATHER_API_KEY=your_weatherapi_key    # weatherapi.com — free tier
```

---

## 📡 API Reference

Base URL: `http://localhost:4000/api`

### 🔐 Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Register new passenger |
| `POST` | `/auth/login` | — | Passenger login |
| `POST` | `/auth/admin/login` | — | Admin login |
| `POST` | `/auth/refresh` | Cookie | Refresh passenger token |
| `POST` | `/auth/admin/refresh` | Cookie | Refresh admin token |
| `POST` | `/auth/logout` | — | Clear all session cookies |
| `GET` | `/auth/me` | 🔒 Passenger | Get current passenger |
| `GET` | `/auth/admin/me` | 🔒 Admin | Get current admin |

### 👤 Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | 🔒 Passenger | Get profile |
| `PATCH` | `/users/me` | 🔒 Passenger | Update profile |
| `POST` | `/users/me/avatar` | 🔒 Passenger | Upload avatar (multipart) |
| `GET` | `/users/me/saved` | 🔒 Passenger | List saved airports/routes |
| `POST` | `/users/me/saved` | 🔒 Passenger | Save an airport/route |
| `DELETE` | `/users/me/saved/:id` | 🔒 Passenger | Remove saved item |

### ✈️ Flights
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/flights` | — | Search flights (`?origin=JFK&destination=LHR&date=2026-09-15`) |
| `GET` | `/flights/:id` | — | Get flight by ID |
| `GET` | `/flights/number/:flightNumber` | — | Get flight by number |
| `GET` | `/flights/:id/events` | — | Get flight change history |
| `POST` | `/flights` | 🔒 Admin | Create flight |
| `PATCH` | `/flights/:id/status` | 🔒 Admin | Update status (notifies all passengers) |
| `PATCH` | `/flights/:id/gate` | 🔒 Admin | Change gate (notifies all passengers) |

### 📋 Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/bookings` | 🔒 Passenger | Create booking (`PENDING_PAYMENT`) |
| `GET` | `/bookings` | 🔒 Passenger | List my bookings |
| `GET` | `/bookings/:id` | 🔒 Passenger | Get booking + passengers |
| `POST` | `/bookings/:id/check-in` | 🔒 Passenger | Check in (generates boarding pass) |
| `POST` | `/bookings/:id/cancel` | 🔒 Passenger | Cancel booking |

### 💳 Payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/payments/booking/:id/intent` | 🔒 Passenger | Create Stripe PaymentIntent |
| `GET` | `/payments/booking/:id` | 🔒 Passenger | Get payment status |
| `POST` | `/payments/booking/:id/refund` | 🔒 Passenger | Request Stripe refund |
| `POST` | `/payments/webhook` | Stripe Sig | Stripe webhook receiver |

### 🧳 Baggage
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/baggage/mine` | 🔒 Passenger | List my baggage |
| `GET` | `/baggage/track/:tag` | — | Track bag by tag reference |
| `POST` | `/baggage/:id/report` | 🔒 Passenger | File lost/damaged report |
| `PATCH` | `/baggage/:id/status` | 🔒 Admin | Update baggage status + belt |

### 🏢 Airports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/airports` | — | List all airports |
| `GET` | `/airports/:iata` | — | Get airport by IATA code |
| `GET` | `/airports/:id/terminals` | — | List terminals |
| `GET` | `/airports/:id/map-points` | — | Get indoor map points |
| `POST` | `/airports` | 🔒 Admin | Create airport |
| `POST` | `/airports/:id/terminals` | 🔒 Admin | Add terminal |
| `POST` | `/airports/:id/map-points` | 🔒 Admin | Add map point |
| `DELETE` | `/airports/:id/map-points/:pointId` | 🔒 Admin | Remove map point |

### 🚪 Gates
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/gates/terminal/:terminalId` | — | List gates in terminal |
| `POST` | `/gates/terminal/:terminalId` | 🔒 Admin | Create gate |
| `PATCH` | `/gates/:id/status` | 🔒 Admin | Update gate status |

### 🔔 Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications` | 🔒 Passenger | List my notifications |
| `GET` | `/notifications/unread-count` | 🔒 Passenger | Get unread count |
| `PATCH` | `/notifications/read-all` | 🔒 Passenger | Mark all read |
| `PATCH` | `/notifications/:id/read` | 🔒 Passenger | Mark one read |
| `GET` | `/notifications/admin` | 🔒 Admin | List admin notifications |
| `GET` | `/notifications/admin/unread-count` | 🔒 Admin | Admin unread count |
| `PATCH` | `/notifications/admin/read-all` | 🔒 Admin | Mark all admin read |
| `PATCH` | `/notifications/admin/:id/read` | 🔒 Admin | Mark admin notification read |

### 📢 Announcements
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/announcements` | — | List announcements (`?airportId=`) |
| `POST` | `/announcements` | 🔒 Admin | Create announcement |

### 💱 Pricing
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/pricing/currencies` | — | List supported currencies |
| `GET` | `/pricing/convert` | — | Convert amount (`?amount=100&from=USD&to=EUR`) |

### 🛍️ Add-ons
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/addons/catalog` | — | List available add-ons |
| `GET` | `/addons/booking/:bookingId` | 🔒 Passenger | List booking add-ons |
| `POST` | `/addons/booking/:bookingId` | 🔒 Passenger | Add extra to booking |
| `DELETE` | `/addons/:addonId` | 🔒 Passenger | Remove add-on |

### 🛡️ Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | 🔒 Admin | Today's summary stats |
| `GET` | `/admin/analytics` | 🔒 Admin (SA/OA) | 30-day charts data |
| `GET` | `/admin/admins` | 🔒 SUPER_ADMIN | List all admins |
| `POST` | `/admin/admins` | 🔒 SUPER_ADMIN | Create admin account |
| `PATCH` | `/admin/admins/:id/active` | 🔒 SUPER_ADMIN | Enable/disable admin |
| `GET` | `/admin/passengers` | 🔒 Admin (SA/OA) | List passengers |
| `PATCH` | `/admin/passengers/:id/active` | 🔒 Admin (SA/OA) | Suspend/reactivate passenger |
| `GET` | `/admin/audit-logs` | 🔒 SUPER_ADMIN | Paginated audit log |
| `GET` | `/admin/audit-logs/export/json` | 🔒 SUPER_ADMIN | Export audit log as JSON |
| `GET` | `/admin/audit-logs/export/pdf` | 🔒 SUPER_ADMIN | Export audit log as PDF |

> **Auth key:** — = public, 🔒 Passenger = passenger JWT required, 🔒 Admin = any admin JWT, 🔒 SUPER_ADMIN = SUPER_ADMIN role only, 🔒 Admin (SA/OA) = SUPER_ADMIN or OPERATIONS_ADMIN

---

## 🗄️ Database Schema

### Tables

```
users                 → Passenger accounts
admins                → Staff accounts (SUPER_ADMIN | OPERATIONS_ADMIN | FLIGHT_MANAGER)
airports              → Airport info with coordinates + facilities
terminals             → Terminals per airport
gates                 → Gates per terminal with status
map_points            → Indoor map POIs (GATE | CHECKIN | SECURITY | BAGGAGE_BELT | LOUNGE | RESTAURANT | SHOP | RESTROOM | PARKING | INFO_DESK | TRANSPORT)
flights               → Flight records with status
flight_events         → Immutable log of gate/status/terminal changes
bookings              → Booking records (PENDING_PAYMENT → CONFIRMED → CHECKED_IN)
booking_passengers    → Individual passengers per booking
booking_addons        → Extras added at checkout
baggage               → Baggage tags per booking
baggage_reports       → Lost/damaged reports
payments              → Stripe payment intents + status
notifications         → Passenger notifications
admin_notifications   → Admin notifications
announcements         → Airport/system-wide announcements
saved_items           → Saved routes/airports per user
audit_logs            → Full action log (actor_type: admin | user | system)
```

---

## 📡 Real-time Events (Socket.IO)

### Client → Server (subscribe)
```js
socket.emit("subscribe:flight", flightId)     // Join a flight room
socket.emit("unsubscribe:flight", flightId)   // Leave a flight room
socket.emit("subscribe:airport", airportId)   // Join an airport room
```

### Server → Client (receive)
```js
socket.on("flight:updated", (flight) => {})           // Status/gate changed
socket.on("notification:new", (notification) => {})   // New passenger notification
socket.on("admin:notification:new", (n) => {})        // New admin notification
socket.on("baggage:updated", (baggage) => {})         // Baggage status changed
socket.on("announcement:new", (announcement) => {})   // New airport announcement
```

### Automatic rooms
- `passenger:<userId>` — joined on connection with valid passenger token
- `admin:<adminId>` — joined on connection with valid admin token
- `admins` — all connected admins (for broadcast admin notifications)
- `flight:<flightId>` — joined via `subscribe:flight`
- `airport:<airportId>` — joined via `subscribe:airport`

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub
2. **render.com** → New → Web Service → connect repo
3. Settings:
   - Root directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `node dist/server.js`
4. Add all env vars from `backend/.env`
5. Deploy → run migrations from Render Shell:
   ```bash
   npm run db:migrate && npm run db:seed
   ```

### Frontend → Vercel

1. **vercel.com** → New Project → import repo
2. Settings:
   - Root directory: `frontend`
   - Framework: `Vite`
   - Build: `npm run build`
   - Output: `dist`
3. Add env vars:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_WEATHER_API_KEY=...
   ```
4. Deploy

### Stripe Webhook (Production)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-backend.onrender.com/api/payments/webhook`
3. Events to select:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
4. Copy signing secret → add as `STRIPE_WEBHOOK_SECRET` in Render env

---

## 🧪 Testing

### Backend (Jest + Supertest)
```bash
cd backend
npm install
npm test           # run all tests
npm run test:watch # watch mode
```

Tests cover: auth registration/login, duplicate email rejection, JWT validation, flight search/filtering, pricing conversion edge cases.

### Frontend (Vitest)
```bash
cd frontend
npm install
npm test           # run all tests
npm run test:watch # watch mode
```

Tests cover: price formatting, currency conversion, password strength meter, status badge styles.

### Stripe test cards
| Card | Behaviour |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |
| `4000 0000 0000 9995` | ❌ Insufficient funds |

Use any future expiry date and any 3-digit CVV.

---

## 🏗️ Architecture Decisions

### Two auth realms
Passengers and admins have completely separate JWT audiences, cookies (`skyport_access` vs `skyport_admin_access`), and auth flows. A stolen passenger token cannot be replayed against admin routes.

### PENDING_PAYMENT booking flow
Bookings are created with `PENDING_PAYMENT` status and only flip to `CONFIRMED` when Stripe's `payment_intent.succeeded` webhook fires — never on client success alone. This prevents unpaid bookings from being confirmed if the client disconnects mid-payment.

### Fire-and-forget email + PDF
Email and PDF generation never block the API response. Both run in async IIFEs with `.catch()` — if SMTP is misconfigured, the booking still works, only the email silently fails (logged to console).

### In-memory cache (Redis-shaped)
The cache service has a `get/set/del/delPrefix` interface deliberately shaped to match ioredis — swap the implementation for Redis in production without touching any call sites.

### Audit log as append-only event log
Every meaningful action creates a row in `audit_logs` — login, register, booking, check-in, flight/gate change, admin management. The actor type (`user` | `admin` | `system`) lets you filter by role. Exports as PDF or JSON from the admin panel.

### Socket.IO rooms
Instead of broadcasting all events globally, every update targets a specific room — `flight:<id>`, `passenger:<userId>`, `admins`. This means a gate change only notifies passengers subscribed to that flight, not every connected socket.

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

Built with ❤️ using TypeScript, React, PostgreSQL, and Stripe.

**[⬆ Back to top](#️-skyport--airport-management-platform)**

</div>
