'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { capitalise, shortTime, WEEKDAYS, type HoursData } from '@/lib/hours';
import { mockProvider } from './mock-provider';
import {
  addDays,
  dayState,
  displayTime,
  firstOpenDate,
  fromIso,
  londonNow,
  longDate,
  monthGrid,
  validateDetails,
  weekdayOf,
  type DayState,
} from './rules';
import type { BookingResult, BookingRules, GuestDetails, IsoDate, SlotAvailability } from './types';
import styles from './BookingFlow.module.css';

export interface BookingFlowProps {
  hours: HoursData;
  rules: BookingRules;
  maxPartySize: number;
  contact: { phone: string; phoneE164: string; email: string };
  allergyNote: string;
  /** True while no booking backend exists (site.json booking.availability.mock). */
  preview: boolean;
  /** Heading level for the step titles: 2 on the booking page, 3 inside the dialog. */
  headingLevel?: 2 | 3;
}

type Step = 'date' | 'guests' | 'time' | 'details' | 'done';
const STEPS: Array<{ id: Exclude<Step, 'done'>; label: string }> = [
  { id: 'date', label: 'Date' },
  { id: 'guests', label: 'Guests' },
  { id: 'time', label: 'Time' },
  { id: 'details', label: 'Your details' },
];
const ORDER: Step[] = ['date', 'guests', 'time', 'details', 'done'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const EMPTY_DETAILS: GuestDetails = { name: '', phone: '', email: '', notes: '' };

const subscribe = () => () => {};

function reason(state: DayState): string {
  switch (state.kind) {
    case 'open':
      return '';
    case 'past':
      return ', unavailable';
    case 'beyond':
      return ', not open for booking yet';
    case 'closed':
      return ', closed';
    case 'closure':
      return `, closed (${state.label})`;
    case 'no-times':
      return ', no times left today';
  }
}

/**
 * Guest booking flow (D59, PAGES.md Booking): date → guests → time → details →
 * confirmation. Talks only to a BookingProvider; today the mock one, so nothing is booked
 * and a notice says so. "Today" comes from the visitor's clock in Europe/London, so the
 * calendar renders only in the browser (the static HTML cannot know the date).
 */
export function BookingFlow({
  hours,
  rules,
  maxPartySize,
  contact,
  allergyNote,
  preview,
  headingLevel = 2,
}: BookingFlowProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const now = useMemo(() => (mounted ? londonNow(new Date()) : null), [mounted]);
  const provider = useMemo(() => mockProvider(hours, rules), [hours, rules]);

  const [step, setStep] = useState<Step>('date');
  // Which way the last move went: the next panel slides in from that side (none at first).
  const [dir, setDir] = useState<'forward' | 'back' | null>(null);
  const [date, setDate] = useState<IsoDate | null>(null);
  const [month, setMonth] = useState<{ year: number; month: number } | null>(null);
  const [party, setParty] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotAvailability[] | null>(null);
  const [details, setDetails] = useState<GuestDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<ReturnType<typeof validateDetails>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const H = `h${headingLevel}` as const;

  // Move focus to the new step's heading, but not on first render.
  useEffect(() => {
    if (moved.current) headingRef.current?.focus();
  }, [step]);

  // Load availability for the chosen date and party size.
  useEffect(() => {
    if (step !== 'time' || !date || !party) return;
    let cancelled = false;
    provider.availability(date, party).then((list) => {
      if (!cancelled) setSlots(list);
    });
    return () => {
      cancelled = true;
    };
  }, [step, date, party, provider]);

  const go = (next: Step) => {
    moved.current = true;
    setDir(ORDER.indexOf(next) < ORDER.indexOf(step) ? 'back' : 'forward');
    setStep(next);
  };

  const shownMonth = useMemo(() => {
    if (month) return month;
    if (!now) return null;
    const start = fromIso(date ?? firstOpenDate(hours, rules, now) ?? now.today);
    return { year: start.year, month: start.month };
  }, [month, now, date, hours, rules]);

  const monthBounds = useMemo(() => {
    if (!now) return null;
    const first = fromIso(now.today);
    const last = fromIso(addDays(now.today, rules.bookingWindowDays));
    return { min: first.year * 12 + first.month, max: last.year * 12 + last.month };
  }, [now, rules.bookingWindowDays]);

  const changeMonth = (delta: number) => {
    if (!shownMonth) return;
    const index = shownMonth.year * 12 + (shownMonth.month - 1) + delta;
    setMonth({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateDetails(details);
    setErrors(found);
    const firstInvalid = (['name', 'phone', 'email', 'notes'] as const).find((f) => found[f]);
    if (firstInvalid) {
      document.getElementById(`booking-${firstInvalid}`)?.focus();
      return;
    }
    if (!date || !time || !party) return;
    setSubmitting(true);
    const res = await provider.submit({ ...details, date, time, partySize: party });
    setSubmitting(false);
    setResult(res);
    go('done');
  };

  const phoneLink = (
    <a href={`tel:${contact.phoneE164}`} className={styles.inlineLink}>
      {contact.phone}
    </a>
  );

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  // "Mondays and Sundays", from the weekly hours (data is the single source).
  const closedNames = WEEKDAYS.filter((d) => !hours.weekly[d].length).map(
    (d) => `${capitalise(d)}s`,
  );
  const closedDays =
    closedNames.length > 1
      ? `${closedNames.slice(0, -1).join(', ')} and ${closedNames.at(-1)}`
      : (closedNames[0] ?? '');

  return (
    <div className={styles.flow} data-dir={dir ?? undefined}>
      {preview ? (
        <p className={styles.preview} role="note">
          <strong>Preview.</strong> Online booking is not live yet: nothing you enter here is sent
          or booked. To book now, call us on {phoneLink}.
        </p>
      ) : null}

      {step !== 'done' ? (
        <ol className={styles.steps} aria-label="Booking steps">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              aria-current={s.id === step ? 'step' : undefined}
              data-done={i < stepIndex ? '' : undefined}
            >
              {s.label}
            </li>
          ))}
        </ol>
      ) : null}

      {/* ---- Summary of the choices so far */}
      {step !== 'date' && step !== 'done' && date ? (
        <dl className={styles.summary}>
          <div>
            <dt>Date</dt>
            <dd>
              {longDate(date)}{' '}
              <button type="button" className={styles.change} onClick={() => go('date')}>
                Change<span className="sr-only"> date</span>
              </button>
            </dd>
          </div>
          {party && step !== 'guests' ? (
            <div>
              <dt>Guests</dt>
              <dd>
                {party}{' '}
                <button type="button" className={styles.change} onClick={() => go('guests')}>
                  Change<span className="sr-only"> number of guests</span>
                </button>
              </dd>
            </div>
          ) : null}
          {time && step === 'details' ? (
            <div>
              <dt>Time</dt>
              <dd>
                {displayTime(time)}{' '}
                <button
                  type="button"
                  className={styles.change}
                  onClick={() => {
                    setSlots(null);
                    go('time');
                  }}
                >
                  Change<span className="sr-only"> time</span>
                </button>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {/* ---- 1. Date */}
      {step === 'date' ? (
        <section aria-labelledby="booking-step" className={styles.panel}>
          <H id="booking-step" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            Choose a date
          </H>
          {!now || !shownMonth || !monthBounds ? (
            <p className={styles.muted}>
              Loading dates… If they do not appear, call us on {phoneLink}.
            </p>
          ) : (
            <>
              <div className={styles.monthBar}>
                <button
                  type="button"
                  className={styles.monthNav}
                  onClick={() => changeMonth(-1)}
                  disabled={shownMonth.year * 12 + shownMonth.month <= monthBounds.min}
                >
                  <span aria-hidden="true">‹</span>
                  <span className="sr-only">Previous month</span>
                </button>
                <p id="booking-month" className={styles.monthLabel} aria-live="polite">
                  {new Intl.DateTimeFormat('en-GB', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                  }).format(new Date(Date.UTC(shownMonth.year, shownMonth.month - 1, 1, 12)))}
                </p>
                <button
                  type="button"
                  className={styles.monthNav}
                  onClick={() => changeMonth(1)}
                  disabled={shownMonth.year * 12 + shownMonth.month >= monthBounds.max}
                >
                  <span aria-hidden="true">›</span>
                  <span className="sr-only">Next month</span>
                </button>
              </div>
              <table className={styles.calendar} aria-labelledby="booking-month">
                <thead>
                  <tr>
                    {DAY_NAMES.map((d) => (
                      <th key={d} scope="col" abbr={d}>
                        {d.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthGrid(shownMonth.year, shownMonth.month).map((week, wi) => (
                    <tr key={wi}>
                      {week.map((iso, di) => {
                        if (!iso) return <td key={di} />;
                        const state = dayState(iso, hours, rules, now);
                        const open = state.kind === 'open';
                        return (
                          <td key={iso}>
                            <button
                              type="button"
                              className={styles.day}
                              disabled={!open}
                              aria-pressed={iso === date}
                              aria-label={`${longDate(iso)}${reason(state)}`}
                              data-today={iso === now.today ? '' : undefined}
                              onClick={() => {
                                setDate(iso);
                                setTime(null);
                                setSlots(null);
                                go('guests');
                              }}
                            >
                              {fromIso(iso).day}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {closedDays ? <p className={styles.muted}>We are closed on {closedDays}.</p> : null}
            </>
          )}
        </section>
      ) : null}

      {/* ---- 2. Guests */}
      {step === 'guests' ? (
        <section aria-labelledby="booking-step" className={styles.panel}>
          <H id="booking-step" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            How many guests?
          </H>
          <div className={styles.choices} role="group" aria-labelledby="booking-step">
            {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={styles.choice}
                aria-pressed={party === n}
                onClick={() => {
                  setParty(n);
                  setTime(null);
                  setSlots(null);
                  go('time');
                }}
              >
                {n}
                <span className="sr-only">{n === 1 ? ' guest' : ' guests'}</span>
              </button>
            ))}
          </div>
          <p className={styles.muted}>
            For more than {maxPartySize} guests, please call us on {phoneLink}.
          </p>
        </section>
      ) : null}

      {/* ---- 3. Time */}
      {step === 'time' && date && party ? (
        <section aria-labelledby="booking-step" className={styles.panel}>
          <H id="booking-step" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            Choose a time
          </H>
          {!slots ? (
            <p className={styles.muted} role="status">
              Checking tables…
            </p>
          ) : !slots.some((s) => s.available) ? (
            <p role="status">
              No tables left for {party} on {longDate(date)}.{' '}
              <button type="button" className={styles.change} onClick={() => go('date')}>
                Try another date
              </button>{' '}
              or call us on {phoneLink}.
            </p>
          ) : (
            hours.weekly[weekdayOf(date)].map((session, index) => {
              const list = slots.filter((s) => s.session === index);
              if (!list.length) return null;
              const label = `${shortTime(session.open)}–${shortTime(session.close)}`;
              return (
                <div key={index} className={styles.session} role="group" aria-label={label}>
                  <p className={styles.sessionLabel} aria-hidden="true">
                    {label}
                  </p>
                  <div className={styles.times}>
                    {list.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={styles.time}
                        disabled={!slot.available}
                        aria-pressed={time === slot.time}
                        onClick={() => {
                          setTime(slot.time);
                          go('details');
                        }}
                      >
                        {displayTime(slot.time)}
                        {!slot.available ? <span className="sr-only">, fully booked</span> : null}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      ) : null}

      {/* ---- 4. Details */}
      {step === 'details' && date && party && time ? (
        <section aria-labelledby="booking-step" className={styles.panel}>
          <H id="booking-step" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            Your details
          </H>
          <form className={styles.form} onSubmit={submit} noValidate>
            {(
              [
                { id: 'name', label: 'Name', type: 'text', auto: 'name' },
                { id: 'phone', label: 'Phone', type: 'tel', auto: 'tel' },
                { id: 'email', label: 'Email', type: 'email', auto: 'email' },
              ] as const
            ).map((f) => (
              <div key={f.id} className={styles.field}>
                <label htmlFor={`booking-${f.id}`}>{f.label}</label>
                <input
                  id={`booking-${f.id}`}
                  name={f.id}
                  type={f.type}
                  autoComplete={f.auto}
                  required
                  value={details[f.id]}
                  aria-invalid={errors[f.id] ? true : undefined}
                  aria-describedby={errors[f.id] ? `booking-${f.id}-error` : undefined}
                  onChange={(e) => setDetails({ ...details, [f.id]: e.target.value })}
                />
                {errors[f.id] ? (
                  <p id={`booking-${f.id}-error`} className={styles.error}>
                    {errors[f.id]}
                  </p>
                ) : null}
              </div>
            ))}
            <div className={styles.field}>
              <label htmlFor="booking-notes">
                Notes <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="booking-notes"
                name="notes"
                rows={3}
                value={details.notes}
                aria-invalid={errors.notes ? true : undefined}
                aria-describedby={`booking-notes-hint${errors.notes ? ' booking-notes-error' : ''}`}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
              />
              <p id="booking-notes-hint" className={styles.hint}>
                {allergyNote}
              </p>
              {errors.notes ? (
                <p id="booking-notes-error" className={styles.error}>
                  {errors.notes}
                </p>
              ) : null}
            </div>
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? 'Sending…' : 'Confirm booking'}
            </button>
          </form>
        </section>
      ) : null}

      {/* ---- 5. Confirmation */}
      {step === 'done' && result && date && time && party ? (
        <section aria-labelledby="booking-step" className={styles.panel}>
          <H id="booking-step" ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
            {result.preview ? 'Preview complete' : 'Your table is booked'}
          </H>
          <dl className={styles.summary}>
            <div>
              <dt>Date</dt>
              <dd>{longDate(date, true)}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{displayTime(time)}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{party}</dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{details.name}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{result.reference}</dd>
            </div>
          </dl>
          {result.preview ? (
            <p className={styles.previewDone}>
              No table has been booked and nothing was sent: online booking is not live yet. To
              book, call us on {phoneLink} or email{' '}
              <a href={`mailto:${contact.email}`} className={styles.inlineLink}>
                {contact.email}
              </a>
              .
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
