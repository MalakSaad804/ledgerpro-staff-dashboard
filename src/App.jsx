import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cleared, restoreSession } from './store/authSlice';
import DashboardLayout from './components/DashboardLayout';
import BookingModal from './components/BookingModal';
import { Spinner } from './components/ui';
import useRealtime from './hooks/useRealtime';
import Login from './pages/Login';
import Overview from './pages/Overview';
import CalendarPage from './pages/CalendarPage';
import BookingsPage from './pages/BookingsPage';

function RequireAuth({ children }) {
  const { user, initializing } = useSelector((s) => s.auth);
  if (initializing) return <Spinner label="Checking your session..." />;
  return user ? children : <Navigate to="/login" replace />;
}

function DashboardRoutes() {
  const live = useRealtime();
  const bookings = useSelector((s) => s.bookings.items);
  const [selectedId, setSelectedId] = useState(null);
  const selected = bookings.find((booking) => booking._id === selectedId);

  return (
    <>
      <Outlet context={{ live, openBooking: (booking) => setSelectedId(booking._id) }} />
      {selected && (
        <BookingModal
          key={selected._id + selected.updatedAt}
          booking={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
    const onExpired = () => dispatch(cleared());
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth><DashboardRoutes /></RequireAuth>}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
