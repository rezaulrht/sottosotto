/**
 * Booking seam (D59, ARCHITECTURE §8). The guest screens talk only to a BookingProvider.
 * Today that is the mock provider (generated availability, nothing booked). When the
 * backend exists, a real provider replaces it and nothing else changes.
 */

/** A calendar date in Europe/London, as YYYY-MM-DD. */
export type IsoDate = string;

export interface Slot {
  /** HH:MM, London time. */
  time: string;
  /** Index of the opening session it belongs to (0 = lunch, 1 = dinner on a normal day). */
  session: number;
}

export interface SlotAvailability extends Slot {
  available: boolean;
}

export interface GuestDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface BookingRequest extends GuestDetails {
  date: IsoDate;
  time: string;
  partySize: number;
}

export interface BookingResult {
  reference: string;
  /** True while no real booking backend exists: nothing was booked. */
  preview: boolean;
}

export interface BookingProvider {
  availability(date: IsoDate, partySize: number): Promise<SlotAvailability[]>;
  submit(request: BookingRequest): Promise<BookingResult>;
}

export interface BookingRules {
  slotMinutes: number;
  lastSeatingMinutesBeforeClose: number;
  bookingWindowDays: number;
  minNoticeMinutes: number;
}
