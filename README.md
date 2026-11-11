# LedgerPro Staff Dashboard

Dashboard for the accountants of **LedgerPro Accountants**. Staff log in, see their own appointments in a calendar and in lists, and can view, edit, reschedule or cancel them. Changes appear live.

**Stack:** React 19, Vite, Redux Toolkit, FullCalendar, Axios, React Router, Socket.IO client.
**Backend:** [ledgerpro-api](https://github.com/MalakSaad804/ledgerpro-api) (Express, MongoDB).

## Run locally

1. Start the API (`npm run seed` once, then `npm run dev`, port 5000).
2. In this folder:

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5174
```

Demo staff logins (created by `npm run seed`):

| Account | Email | Password |
|---------|-------|----------|
| Staff 1 (Ayesha) | staff@ledgerpro.com | Staff@12345 |
| Staff 2 (Bilal) | staff2@ledgerpro.com | Staff@12345 |

## What staff can do

| Page | What it shows |
|------|---------------|
| Overview | Cards (today, upcoming, pending, cancelled) and the next appointments |
| Calendar | FullCalendar with month, week, day and list views. Colours show the status. Click an event to open it |
| All bookings | Table with status tabs, search, and an Open button |
| Booking window | Details, **Edit** (status, staff note, change time using only free slots) and **Cancel** |

Status colours: amber = pending, blue = confirmed, green = completed, grey = cancelled.

## How it meets the task

1. **Layout with navigation:** `DashboardLayout` has a sidebar, a top bar with the live indicator and logout.
2. **Calendar view:** `CalendarPage` uses FullCalendar; bookings become coloured events.
3. **View, edit, cancel:** `BookingModal` calls `PATCH /staff/bookings/:id` through a Redux thunk.
4. **Data ownership at the API level:** the dashboard never filters by user. The API does it (see below).
5. **Real time:** `useRealtime` listens to a Socket.IO event and refreshes the bookings.

## Data ownership (how it is enforced)

The rule lives in the API, in `src/controllers/staffBooking.controller.js`:

- Every booking stores the `staff` it is assigned to (set automatically when a customer books).
- Every staff query adds `{ staff: <id from the verified token> }`. The id is never taken from the request.
- Asking for someone else's booking returns `404`, so the API does not reveal it exists.
- Rescheduling only offers free times inside the staff member's own working hours.

How to check it yourself: log in as Staff 1 and Staff 2 in two browsers. Make customer bookings. Each dashboard only shows its own. Copy a booking id from one account and call `GET /api/staff/bookings/<id>` with the other account's token: you get 404.

## Real-time updates

On login the dashboard opens a Socket.IO connection with the token. The server puts each staff member in a private room. When a booking is created, cancelled or edited, only the assigned staff member gets `booking:changed`, and the dashboard re-fetches. The top bar shows **Live / Connecting / Offline**, and a toast tells the user what happened. Test: keep the dashboard open, book as a customer in the other app, and watch it appear.

## Structure

```
src/
  api/client.js        Axios, token header, error messages
  store/               Redux Toolkit: authSlice, bookingsSlice, uiSlice (toasts)
  hooks/useRealtime.js Socket.IO connection
  components/          DashboardLayout, BookingModal, StatusBadge, ToastHost
  pages/               Login, Overview, CalendarPage, BookingsPage
```

## Decisions

- **Redux Toolkit for bookings:** the calendar, list and overview share one list, so a change shows everywhere at once.
- **Refetch on event instead of patching the store from the event:** one source of truth, and every read goes through the protected API.
- **Silent refresh:** the big spinner only appears on first load, so the calendar does not flash when updates arrive.
- **Cancelled and completed bookings are read-only.**

## Limitations

- Calendar and times use the browser's time zone (fine for Pakistan, the business location).
- No automated tests; checked by hand in the browser.
- Staff cannot yet edit their own working hours from the UI (API supports it).
