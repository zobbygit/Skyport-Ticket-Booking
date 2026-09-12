export type FlightStatus =
  | "SCHEDULED" | "CHECK_IN_OPEN" | "BOARDING" | "GATE_CHANGED"
  | "DELAYED" | "DEPARTED" | "LANDED" | "CANCELLED";

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED" | "COMPLETED";

export type BaggageStatus =
  | "CHECKED_IN" | "LOADED" | "IN_TRANSIT" | "ARRIVED"
  | "AT_BAGGAGE_CLAIM" | "READY_FOR_COLLECTION" | "DELAYED" | "LOST";

export interface Airport {
  id: string;
  iata_code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  facilities: string[];
  transportation: string[];
}

export interface Terminal {
  id: string;
  code: string;
  name: string;
  congestion_level: string;
}

export interface Gate {
  id: string;
  code: string;
  status: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  aircraft?: string;
  origin_airport: Airport;
  destination_airport: Airport;
  departure_time: string;
  arrival_time: string;
  terminal?: Terminal | null;
  gate?: Gate | null;
  boarding_time?: string | null;
  status: FlightStatus;
  base_price: number;
  seats_available: number;
}

export interface Booking {
  id: string;
  booking_reference: string;
  flight_id: string;
  flight: Flight;
  cabin_class: string;
  seat?: string | null;
  boarding_group?: string | null;
  passenger_count: number;
  status: BookingStatus;
  checked_in_at?: string | null;
}

export interface Baggage {
  id: string;
  tag_reference: string;
  status: BaggageStatus;
  belt?: string | null;
  last_scan_location?: string | null;
  last_scan_at: string;
  booking: Booking;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_flight_id?: string | null;
  related_booking_id?: string | null;
  created_at: string;
}

export interface Account {
  id?: string;
  sub?: string;
  full_name?: string;
  email: string;
  role: string;
  phone?: string;
  avatar_url?: string;
}
