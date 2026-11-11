import { STATUS } from '../utils';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className="badge" style={{ color: s.color, background: s.bg }}>
      <span className="dot" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}
