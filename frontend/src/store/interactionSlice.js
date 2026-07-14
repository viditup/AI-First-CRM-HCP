import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interactionApi } from '../api/client';

export const fetchInteractions = createAsyncThunk('interaction/fetchInteractions', async (params) => {
  const response = await interactionApi.list(params);
  return response.data;
});

export const createInteraction = createAsyncThunk('interaction/createInteraction', async (data) => {
  const response = await interactionApi.create(data);
  return response.data;
});

export const updateInteraction = createAsyncThunk('interaction/updateInteraction', async ({ id, data }) => {
  const response = await interactionApi.update(id, data);
  return response.data;
});

export const deleteInteraction = createAsyncThunk('interaction/deleteInteraction', async (id) => {
  await interactionApi.delete(id);
  return id;
});

const interactionSlice = createSlice({
  name: 'interaction',
  initialState: {
    list: [],
    loading: false,
    error: null,
    formStatus: 'idle',
  },
  reducers: {
    resetFormStatus: (state) => { state.formStatus = 'idle'; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => { state.loading = true; })
      .addCase(fetchInteractions.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchInteractions.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(createInteraction.pending, (state) => { state.formStatus = 'submitting'; })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.formStatus = 'success';
        state.list.unshift(action.payload);
      })
      .addCase(createInteraction.rejected, (state) => { state.formStatus = 'error'; })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        const idx = state.list.findIndex((i) => i.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.list = state.list.filter((i) => i.id !== action.payload);
      });
  },
});

export const { resetFormStatus } = interactionSlice.actions;
export default interactionSlice.reducer;
