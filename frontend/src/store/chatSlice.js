import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatApi } from '../api/client';

export const sendChatMessage = createAsyncThunk('chat/sendMessage', async ({ message, conversationId }) => {
  const response = await chatApi.send(message, conversationId);
  return response.data;
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    conversationId: null,
    loading: false,
    error: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload, timestamp: new Date().toISOString() });
    },
    clearChat: (state) => {
      state.messages = [];
      state.conversationId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.conversationId = action.payload.conversation_id;
        state.messages.push({
          role: 'assistant',
          content: action.payload.response,
          toolCalls: action.payload.tool_calls,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.messages.push({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date().toISOString(),
        });
      });
  },
});

export const { addUserMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
