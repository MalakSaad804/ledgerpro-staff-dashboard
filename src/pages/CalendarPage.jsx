import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { fetchBookings } from '../store/bookingsSlice';
import BookingModal from '../components/BookingModal';
import { ErrorBox, Spinner } from '../components/ui';
import { STATUS } from '../utils';

export default function CalendarPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.bookings);
  const [selectedId, setSelectedId] = useState(null);
  const selected = items.find((b) => b._id === selectedId);

  // turn bookings into calendar events, coloured by status
  const events = useMemo(
    () =>
      items.map((b) => ({
        id: b._id,
        title: `${b.service?.name || 'Booking'} - ${b.customer?.name || ''}`,
        start: b.slotStart,
        end: b.slotEnd || undefined,
        backgroundColor: STATUS[b.status]?.color,
        borderColor: STATUS[b.status]?.color,
        classNames: b.status === 'cancelled' ? ['ev-cancelled'] : [],
      })),
    [items]
  );

  if (status === 'loading') return <Spinner label="Loading your calendar..." />;
  if (status === 'failed') return <ErrorBox message={error} onRetry={() => dispatch(fetchBookings())} />;

  return (
    <div>
      <h1>Calendar</h1>
      <div className="legend">
        {Object.entries(STATUS).map(([k, v]) => (
          <span key={k}><span className="dot" style={{ background: v.color }} /> {v.label}</span>
        ))}
      </div>
      <div className="card calendar-card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={window.innerWidth < 700 ? 'listWeek' : 'timeGridWeek'}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
          }}
          buttonText={{ today: 'Today', month: 'Month', week: 'Week', day: 'Day', list: 'List' }}
          events={events}
          eventClick={(info) => setSelectedId(info.event.id)}
          slotMinTime="08:00:00"
          slotMaxTime="19:00:00"
          allDaySlot={false}
          nowIndicator
          height="auto"
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          noEventsText="No appointments in this period"
        />
      </div>
      {selected && <BookingModal key={selected._id + selected.updatedAt} booking={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
