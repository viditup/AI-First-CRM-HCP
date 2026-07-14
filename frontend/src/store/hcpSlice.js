import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hcpApi } from '../api/client';

export const fetchHcps = createAsyncThunk('hcp/fetchHcps', async (params) => {
  const response = await hcpApi.list(params);
  return response.data;
});

export const fetchHcp = createAsyncThunk('hcp/fetchHcp', async (id) => {
  const response = await hcpApi.get(id);
  return response.data;
});

const hcpSlice = createSlice({
  name: 'hcp',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedHcp: (state, action) => {
      state.selected = action.payload;
    },
    clearSelectedHcp: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHcps.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchHcps.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchHcps.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(fetchHcp.fulfilled, (state, action) => { state.selected = action.payload; });
  },
});

export const { setSelectedHcp, clearSelectedHcp } = hcpSlice.actions;
export default hcpSlice.reducer;
