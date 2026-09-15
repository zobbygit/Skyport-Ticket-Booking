-- ============================================================
-- SkyPort PostgreSQL Schema
-- Run against Neon Postgres. Idempotent (CREATE ... IF NOT EXISTS).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- ENUMS ----------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('PASSENGER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'OPERATIONS_ADMIN', 'FLIGHT_MANAGER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE flight_status AS ENUM (
    'SCHEDULED', 'CHECK_IN_OPEN', 'BOARDING', 'GATE_CHANGED',
    'DELAYED', 'DEPARTED', 'LANDED', 'CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE booking_status AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE baggage_status AS ENUM (
    'CHECKED_IN', 'LOADED', 'IN_TRANSIT', 'ARRIVED',
    'AT_BAGGAGE_CLAIM', 'READY_FOR_COLLECTION', 'DELAYED', 'LOST'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


DO $$ BEGIN
  ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'PENDING_PAYMENT' BEFORE 'CONFIRMED';
EXCEPTION WHEN others THEN NULL; END $$;

-- ---------- USERS ----------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(30),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'PASSENGER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ---------- ADMINS ----------
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role admin_role NOT NULL DEFAULT 'FLIGHT_MANAGER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins (email);

-- ---------- AIRPORTS ----------
CREATE TABLE IF NOT EXISTS airports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iata_code CHAR(3) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  operational_status VARCHAR(50) NOT NULL DEFAULT 'NORMAL',
  facilities JSONB NOT NULL DEFAULT '[]',
  transportation JSONB NOT NULL DEFAULT '[]',
  security_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports (iata_code);

-- ---------- TERMINALS / GATES ----------
CREATE TABLE IF NOT EXISTS terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  congestion_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
  UNIQUE (airport_id, code)
);

CREATE TABLE IF NOT EXISTS gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  terminal_id UUID NOT NULL REFERENCES terminals(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  UNIQUE (terminal_id, code)
);

CREATE TABLE IF NOT EXISTS map_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  terminal_id UUID REFERENCES terminals(id) ON DELETE SET NULL,
  type VARCHAR(40) NOT NULL,
  label VARCHAR(150) NOT NULL,
  x DOUBLE PRECISION NOT NULL,
  y DOUBLE PRECISION NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_map_points_airport ON map_points (airport_id);

-- ---------- FLIGHTS ----------
CREATE TABLE IF NOT EXISTS flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_number VARCHAR(10) NOT NULL,
  airline VARCHAR(100) NOT NULL,
  aircraft VARCHAR(100),
  origin_airport_id UUID NOT NULL REFERENCES airports(id),
  destination_airport_id UUID NOT NULL REFERENCES airports(id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  terminal_id UUID REFERENCES terminals(id),
  gate_id UUID REFERENCES gates(id),
  boarding_time TIMESTAMPTZ,
  status flight_status NOT NULL DEFAULT 'SCHEDULED',
  cabin_classes JSONB NOT NULL DEFAULT '["ECONOMY","PREMIUM_ECONOMY","BUSINESS","FIRST"]',
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  seats_available INTEGER NOT NULL DEFAULT 150,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flights_route_date
  ON flights (origin_airport_id, destination_airport_id, departure_time);
CREATE INDEX IF NOT EXISTS idx_flights_number ON flights (flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights (status);

CREATE TABLE IF NOT EXISTS flight_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flight_id UUID NOT NULL REFERENCES flights(id) ON DELETE CASCADE,
  event_type VARCHAR(40) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_flight_events_flight ON flight_events (flight_id);

-- ---------- BOOKINGS ----------
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(10) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flight_id UUID NOT NULL REFERENCES flights(id),
  cabin_class VARCHAR(30) NOT NULL DEFAULT 'ECONOMY',
  seat VARCHAR(10),
  boarding_group VARCHAR(5),
  passenger_count INTEGER NOT NULL DEFAULT 1,
  status booking_status NOT NULL DEFAULT 'CONFIRMED',
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  confirmation_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  cancellation_email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_flight ON bookings (flight_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference ON bookings (booking_reference);

-- ---------- BOOKING PASSENGERS ----------
CREATE TABLE IF NOT EXISTS booking_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  passport_number VARCHAR(30),
  date_of_birth DATE,
  seat VARCHAR(10),
  boarding_group VARCHAR(5),
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking ON booking_passengers (booking_id);

-- ---------- PAYMENTS ----------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'usd',
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  stripe_client_secret TEXT,
  failure_reason TEXT,
  refund_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking
  ON payments (booking_id);

CREATE INDEX IF NOT EXISTS idx_payments_intent
  ON payments (stripe_payment_intent_id);


-- ---------- BAGGAGE ----------
CREATE TABLE IF NOT EXISTS baggage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tag_reference VARCHAR(15) UNIQUE NOT NULL,
  status baggage_status NOT NULL DEFAULT 'CHECKED_IN',
  belt VARCHAR(10),
  terminal_id UUID REFERENCES terminals(id),
  last_scan_location VARCHAR(150),
  last_scan_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_availability TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_baggage_booking ON baggage (booking_id);

CREATE TABLE IF NOT EXISTS baggage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baggage_id UUID NOT NULL REFERENCES baggage(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- NOTIFICATIONS ----------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_flight_id UUID REFERENCES flights(id),
  related_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_id UUID,
  related_entity_type VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications (created_at DESC);

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS related_booking_id UUID
REFERENCES bookings(id)
ON DELETE CASCADE;

-- ---------- ANNOUNCEMENTS ----------
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id UUID REFERENCES airports(id),
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- SAVED ITEMS ----------
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  origin_airport_id UUID REFERENCES airports(id),
  destination_airport_id UUID REFERENCES airports(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items (user_id);

-- ---------- AUDIT LOGS ----------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_admin_id UUID REFERENCES admins(id),
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns safely (idempotent on re-run)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES users(id);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS actor_type VARCHAR(20) NOT NULL DEFAULT 'admin';

-- Indexes AFTER the columns exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_user ON audit_logs (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (created_at DESC);

-- ---------- BOOKING ADD-ONS ----------
CREATE TABLE IF NOT EXISTS booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  label VARCHAR(100) NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_booking_addons_booking ON booking_addons (booking_id);


-- ============================================================
-- SkyPort — Migration to match bookings.service.ts v2
-- ============================================================

-- 1. bookings.confirmed_at
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- 2. bookings.status default
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'PENDING_PAYMENT';

-- 3. baggage.passenger_id
ALTER TABLE baggage
  ADD COLUMN IF NOT EXISTS passenger_id UUID
  REFERENCES booking_passengers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_baggage_passenger ON baggage (passenger_id);

-- 4. booking_passengers.flight_id (denormalized for seat uniqueness)
ALTER TABLE booking_passengers
  ADD COLUMN IF NOT EXISTS flight_id UUID REFERENCES flights(id);
CREATE INDEX IF NOT EXISTS idx_booking_passengers_flight
  ON booking_passengers (flight_id);

-- Backfill flight_id from bookings
UPDATE booking_passengers bp
SET flight_id = b.flight_id
FROM bookings b
WHERE bp.booking_id = b.id AND bp.flight_id IS NULL;

-- 5. Unique seat per flight
CREATE UNIQUE INDEX IF NOT EXISTS uniq_passenger_seat_per_flight
  ON booking_passengers (flight_id, seat)
  WHERE seat IS NOT NULL;

-- 6. Optional: add NO_SHOW to booking_status
DO $$ BEGIN
  ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'NO_SHOW';
EXCEPTION WHEN others THEN NULL; END $$;

-- 7. Optional: constrain audit actor_type
DO $$ BEGIN
  ALTER TABLE audit_logs
    ADD CONSTRAINT chk_actor_type CHECK (actor_type IN ('admin','user','system'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;