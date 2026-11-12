import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { fetchBookings } from '../store/bookingsSlice';
import StatusBadge from '../components/StatusBadge';
import { ErrorBox, Spinner } from '../components/ui';
import { STATUS, fmtDateTime } from '../utils';

const FILTERS = ['all', ...Object.keys(STATUS)];

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((s) => s.bookings);
  const { openBooking } = useOutletContext();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (!q) return true;
      return [b.customer?.name, b.customer?.email, b.service?.name].some((t) => t?.toLowerCase().includes(q));
    });
  }, [items, filter, query]);

  if (status === 'loading') return <Spinner label="Loading bookings..." />;
  if (status === 'failed') return <ErrorBox message={error} onRetry={() => dispatch(fetchBookings())} />;

  return (
    <div>
      <h1>All bookings</h1>
      <div className="toolbar">
        <div className="tabs">
          {FILTERS.map((f) => (
            <button key={f} className={`tab ${filter === f ? 'tab-active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : STATUS[f].label}
              <span className="count">{f === 'all' ? items.length : items.filter((b) => b.status === f).length}</span>
            </button>
          ))}
        </div>
        <input className="search" placeholder="Search customer or service" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {rows.length === 0 ? (
        <div className="card empty">No bookings match.</div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>When</th><th>Customer</th><th>Service</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id} className={b.status === 'cancelled' ? 'row-cancelled' : ''}>
                  <td>{fmtDateTime(b.slotStart)}</td>
                  <td>{b.customer?.name}<div className="muted">{b.customer?.email}</div></td>
                  <td>{b.service?.name}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td><button className="btn btn-small btn-ghost" onClick={() => openBooking(b)}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
