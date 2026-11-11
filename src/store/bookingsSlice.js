import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { errorMessage } from '../api/client';

export const fetchBookings = createAsyncThunk('bookings/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/staff/bookings');
    return data;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

// changes can include: status, staffNotes, slotStart
export const updateBooking = createAsyncThunk('bookings/update', async ({ id, changes }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/staff/bookings/${id}`, changes);
    return data;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

const slice = createSlice({
  name: 'bookings',
  initialState: { items: [], status: 'idle', error: null, lastSynced: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchBookings.pending, (s) => {
      // show the big spinner only the first time; later refreshes happen silently
      if (s.status !== 'succeeded') s.status = 'loading';
    })
      .addCase(fetchBookings.fulfilled, (s, a) => {
        s.items = a.payload;
        s.status = 'succeeded';
        s.error = null;
        s.lastSynced = Date.now();
      })
      .addCase(fetchBookings.rejected, (s, a) => {
        s.status = s.items.length ? 'succeeded' : 'failed';
        s.error = a.payload || 'Could not load bookings';
      })
      .addCase(updateBooking.fulfilled, (s, a) => {
        const i = s.items.findIndex((x) => x._id === a.payload._id);
        if (i >= 0) s.items[i] = a.payload;
      });
  },
});

export default slice.reducer;

// selectors
export const selectBookings = (s) => s.bookings.items;
export const isOpen = (b) => ['pending', 'confirmed'].includes(b.status);
export const endOf = (b) => new Date(b.slotEnd || b.slotStart).getTime();

export const selectUpcoming = (s) =>
  s.bookings.items.filter((b) => isOpen(b) && endOf(b) >= Date.now());

export const selectStats = (s) => {
  const items = s.bookings.items;
  const today = new Date().toDateString();
  return {
    today: items.filter((b) => isOpen(b) && new Date(b.slotStart).toDateString() === today).length,
    upcoming: items.filter((b) => isOpen(b) && endOf(b) >= Date.now()).length,
    pending: items.filter((b) => b.status === 'pending').length,
    cancelled: items.filter((b) => b.status === 'cancelled').length,
  };
};
