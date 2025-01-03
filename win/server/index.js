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
  socket.on("chat message", (msg) => {
    // 클라이언트가 chat message 이벤트로 데이터를 보냈을 때 실행
    io.emit("chat message", msg); // 받은 메시지를 모든 연결된 클라이언트에게 전송
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// 서버 실행
server.listen(4000, () => {
  console.log("Socket.IO server running on http://localhost:4000");
});
