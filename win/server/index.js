// 서버 코드

const express = require("express"); //Node.js의 서버를 쉽게 구축할 수 있는 라이브러리
const http = require("http"); // 기본 HTTP 서버 모듈, Express와 결합하여 사용할 수 있음
const { Server } = require("socket.io");

// Express 앱 및 서버 초기화
const app = express(); // Express 앱 객체 생성, 요청/응답을 처리하는 역할
const server = http.createServer(app); // HTTP 서버를 생성하고 Express 앱을 연결

// Socket.IO 서버 초기화
const io = new Server(server, {
  cors: {
    // CORS 설정
    origin: "http://localhost:3000", // 리액트 프론트엔드에서 백엔드로 요청을 보낼 수 있도록 허용
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // 클라이언트가 Socket.IO 서버에 연결될 때 실행되는 이벤트
  console.log("A user connected");

  // 채팅에 참여하는 이벤트
  socket.on("join room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // 메시지를 채팅방에 보내는 이벤트
  socket.on("chat message", (msg) => {
    // roomId에 해당하는 방으로 메시지 발송
    io.to(msg.roomId).emit("chat message", msg);
  });

  // 채팅방을 떠나는 이벤트
  socket.on("leave room", (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// 서버 실행
server.listen(4000, () => {
  console.log("Socket.IO server running on http://localhost:4000");
});
