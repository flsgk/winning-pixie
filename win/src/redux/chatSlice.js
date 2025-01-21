import { create } from "@mui/material/styles/createTransitions";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRoomId: null,
  chatRoomInfo: null,
  gameInfo: null,
  messages: [],
  currentUserId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoomId(state, action) {
      state.currentRoomId = action.payload;
    },
    setChatRoomInfo(state, action) {
      state.chatRoomInfo = action.payload;
    },
    setGameInfo(state, action) {
      state.gameInfo = action.payload;
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    addMessage(state, action) {
      state.messages.push(action.payload);
    },
    setCurrentUserId(state, action) {
      state.currentUserId = action.payload;
    },
  },
});

export const {
  setCurrentRoomId,
  setChatRoomInfo,
  setGameInfo,
  setMessages,
  addMessage,
  setCurrentUserId,
} = chatSlice.actions;

export default chatSlice.reducer;
