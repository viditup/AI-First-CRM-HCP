import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    inputMode: 'form',
    sidebarOpen: true,
  },
  reducers: {
    setInputMode: (state, action) => { state.inputMode = action.payload; },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
  },
});

export const { setInputMode, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
