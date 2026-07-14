import { configureStore } from '@reduxjs/toolkit';
import hcpReducer from './hcpSlice';
import interactionReducer from './interactionSlice';
import chatReducer from './chatSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    hcp: hcpReducer,
    interaction: interactionReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
});
