import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { getToken } from '../api/client';
import { fetchBookings } from '../store/bookingsSlice';
import { toast } from '../store/uiSlice';

const MESSAGES = {
  created: 'New booking received',
  cancelled: 'A booking was cancelled',
  rescheduled: 'A booking was rescheduled',
  updated: 'A booking was updated',
};

// Keeps a live connection to the API. When a booking changes anywhere
// (a customer books, another tab edits), the list is refreshed automatically.
export default function useRealtime() {
  const dispatch = useDispatch();
  const [state, setState] = useState('connecting'); // connecting | live | offline

  useEffect(() => {
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(url, { auth: { token: getToken() } });

    socket.on('connect', () => {
      setState('live');
      dispatch(fetchBookings()); // catch up on anything missed while offline
    });
    socket.on('disconnect', () => setState('offline'));
    socket.on('connect_error', () => setState('offline'));
    socket.on('booking:changed', ({ action }) => {
      dispatch(fetchBookings());
      dispatch(toast(MESSAGES[action] || 'Bookings updated', 'info'));
    });

    return () => socket.disconnect();
  }, [dispatch]);

  return state;
}
