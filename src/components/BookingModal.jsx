import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import api, { errorMessage } from '../api/client';
import { updateBooking } from '../store/bookingsSlice';
import { toast } from '../store/uiSlice';
import { STATUS, fmtDateTime, todayStr } from '../utils';
import StatusBadge from './StatusBadge';
import { ErrorBox, Spinner } from './ui';

export default function BookingModal({ booking, onClose }) {
  const dispatch = useDispatch();
  const closed = ['cancelled', 'completed'].includes(booking.status);

  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [notes, setNotes] = useState(booking.staffNotes || '');
  const [moveTime, setMoveTime] = useState(false);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newStart, setNewStart] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // close with the Escape key
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // load free times for the chosen date (only this staff member's own schedule)
  useEffect(() => {
    if (!moveTime || !date) return;
    setSlotsLoading(true);
    setNewStart('');
    setError('');
    api
      .get(`/staff/bookings/${booking._id}/slots`, { params: { date } })
      .then(({ data }) => setSlots(data.slots))
      .catch((err) => { setSlots([]); setError(errorMessage(err)); })
      .finally(() => setSlotsLoading(false));
  }, [moveTime, date, booking._id]);

  const send = async (changes, successText) => {
    setSaving(true);
    setError('');
    try {
      await dispatch(updateBooking({ id: booking._id, changes })).unwrap();
      dispatch(toast(successText, 'success'));
      onClose();
    } catch (msg) {
      setError(typeof msg === 'string' ? msg : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    const changes = {};
    if (status !== booking.status) changes.status = status;
    if (notes !== (booking.staffNotes || '')) changes.staffNotes = notes;
    if (moveTime && newStart) changes.slotStart = newStart;
    if (moveTime && !newStart) return setError('Pick a new time slot, or turn off "Change time".');
    if (Object.keys(changes).length === 0) return setError('Nothing was changed.');
    send(changes, 'Booking saved');
  };

  const cancelBooking = () => {
    if (window.confirm('Cancel this booking? The customer will see it as cancelled.')) {
      send({ status: 'cancelled' }, 'Booking cancelled');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{booking.service?.name || 'Booking'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <dl className="details">
          <dt>Status</dt><dd><StatusBadge status={booking.status} /></dd>
          <dt>When</dt><dd>{fmtDateTime(booking.slotStart)}</dd>
          <dt>Customer</dt><dd>{booking.customer?.name} <span className="muted">({booking.customer?.email})</span></dd>
          <dt>Assigned to</dt><dd>{booking.staff?.name || 'Unassigned'}</dd>
          {booking.notes && (<><dt>Customer note</dt><dd>{booking.notes}</dd></>)}
          {booking.staffNotes && !editing && (<><dt>Staff note</dt><dd>{booking.staffNotes}</dd></>)}
        </dl>

        <ErrorBox message={error} />

        {editing && (
          <div className="edit-box">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            <label htmlFor="staffNotes">Staff note</label>
            <textarea id="staffNotes" rows="3" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />

            <label className="check">
              <input type="checkbox" checked={moveTime} onChange={(e) => { setMoveTime(e.target.checked); setNewStart(''); }} />
              Change time
            </label>
            {moveTime && (
              <>
                <input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
                {slotsLoading && <Spinner label="Checking your schedule..." />}
                {date && !slotsLoading && slots.length === 0 && <p className="muted">No working hours on that day.</p>}
                <div className="slot-grid">
                  {slots.map((s) => (
                    <button
                      key={s.start} type="button" disabled={!s.available}
                      className={`slot ${newStart === s.start ? 'slot-selected' : ''}`}
                      onClick={() => setNewStart(s.start)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="modal-actions">
          {closed && <span className="muted">This booking is {booking.status} and can no longer be changed.</span>}
          {!closed && !editing && (
            <>
              <button className="btn" onClick={() => setEditing(true)}>Edit booking</button>
              <button className="btn btn-danger" onClick={cancelBooking} disabled={saving}>Cancel booking</button>
            </>
          )}
          {!closed && editing && (
            <>
              <button className="btn" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
              <button className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}>Back</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
