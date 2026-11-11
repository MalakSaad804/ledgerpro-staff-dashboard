import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { fetchBookings } from '../store/bookingsSlice';
import useRealtime from '../hooks/useRealtime';
import ToastHost from './ToastHost';

const LIVE_TEXT = { live: 'Live', connecting: 'Connecting...', offline: 'Offline' };

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const live = useRealtime();

  useEffect(() => { dispatch(fetchBookings()); }, [dispatch]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo">LedgerPro<span>Staff</span></div>
        <nav>
          <NavLink to="/" end>Overview</NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/bookings">All bookings</NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <span className={`live live-${live}`} title="Real-time connection to the server">
            <span className="live-dot" /> {LIVE_TEXT[live]}
          </span>
          <div className="who">
            <div>
              <strong>{user.name}</strong>
              <div className="muted role">{user.role}</div>
            </div>
            <button className="btn btn-small btn-ghost" onClick={() => { dispatch(logout()); navigate('/login'); }}>
              Log out
            </button>
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
      <ToastHost />
    </div>
  );
}
