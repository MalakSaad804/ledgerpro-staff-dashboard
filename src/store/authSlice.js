import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { errorMessage, getToken, setToken } from '../api/client';

const STAFF_ROLES = ['staff', 'admin'];

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    if (!STAFF_ROLES.includes(data.role)) {
      return rejectWithValue('This dashboard is for staff accounts only.');
    }
    setToken(data.token);
    const me = await api.get('/auth/me');
    return me.data;
  } catch (err) {
    return rejectWithValue(errorMessage(err));
  }
});

// when the page reloads, use the saved token to get the user back
export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  if (!getToken()) return rejectWithValue(null);
  try {
    const { data } = await api.get('/auth/me');
    if (!STAFF_ROLES.includes(data.role)) {
      setToken(null);
      return rejectWithValue(null);
    }
    return data;
  } catch {
    setToken(null);
    return rejectWithValue(null);
  }
});

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null, initializing: Boolean(getToken()) },
  reducers: {
    cleared(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(login.pending, (s) => { s.status = 'loading'; s.error = null; })
      .addCase(login.fulfilled, (s, a) => { s.status = 'idle'; s.user = a.payload; })
      .addCase(login.rejected, (s, a) => { s.status = 'idle'; s.error = a.payload || 'Login failed'; })
      .addCase(restoreSession.fulfilled, (s, a) => { s.user = a.payload; s.initializing = false; })
      .addCase(restoreSession.rejected, (s) => { s.initializing = false; });
  },
});

export const logout = () => (dispatch) => {
  setToken(null);
  dispatch(slice.actions.cleared());
};
export const { cleared } = slice.actions;
export default slice.reducer;
