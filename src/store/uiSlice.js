import { createSlice, nanoid } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    toast: {
      reducer(state, a) { state.toasts.push(a.payload); },
      prepare(text, type = 'info') { return { payload: { id: nanoid(), text, type } }; },
    },
    dismissToast(state, a) { state.toasts = state.toasts.filter((t) => t.id !== a.payload); },
  },
});

export const { toast, dismissToast } = slice.actions;
export default slice.reducer;
