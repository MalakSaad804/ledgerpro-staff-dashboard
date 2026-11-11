export const STATUS = {
  pending: { label: 'Pending', color: '#d97706', bg: '#fef3c7' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: '#dbeafe' },
  completed: { label: 'Completed', color: '#059669', bg: '#d1fae5' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bg: '#e5e7eb' },
};

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
