import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ref, onValue, serverTimestamp, push, off } from "firebase/database";
import { auth, database } from "../firebase";
import { io } from "socket.io-client";
import {
  Sheet,
  Box,
  FormControl,
  Textarea,
  Button,
  Stack,
  Typography,
} from "@mui/joy";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { da } from "date-fns/locale";

const socket = io("http://localhost:4000"); // 여기에서 4000번 포트를 확인

const ChatRoom = () => {
  const { roomId } = useParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  // 유저 정보 가져오기
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 컴포넌트가 마운트되면 해당 채팅방에 대한 메시지를 받기 시작
  useEffect(() => {
    // 방에 입장
    socket.emit("join room", roomId);

    // 서버에서 메시지를 받는 이벤트
    socket.on("chat message", (msg) => {
      if (msg.roomId === roomId) {
        setMessages((prevMessages) => [...prevMessages, msg]); // 해당 roomId에만 메시지 추가
      }
    });

    // 컴포넌트 언마운트 시 clean up
    return () => {
      socket.emit("leave room", roomId); // 채팅방을 떠날 때
      socket.off("chat message"); // 메시지 수신 이벤트 해제
    };
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    if (input) {
      const user = auth.currentUser;

      if (user) {
        const messageData = {
          roomId,
          text: input,
          sender: currentUserId,
          timestamp: serverTimestamp(), // 서버 시간 저장
        };

        // Firebase 데이터베이스에 저장
        const messageRef = ref(database, `chatRooms/${roomId}/messages`);
        push(messageRef, messageData);

        socket.emit("chat message", messageData); // 서버로 입력한 값을 전송
        setInput("");
      }
    }
  };

  // 채팅방에서 메시지 가져오기
  useEffect(() => {
    const messageRef = ref(database, `chatRooms/${roomId}/messages`);
    onValue(messageRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        setMessages(Object.values(messagesData));
      }
    });
    return () => {
      off(messageRef);
    };
  }, [roomId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) {
      sendMessage();
    }
  };

  return (
    <Sheet>
      <div>
        <Typography>{roomId}</Typography>
        {messages.map((messageData, index) => (
          <Typography
            sx={{
              fontSize: "sm",
              textAlign:
                messageData.sender === currentUserId ? "right" : "left",
            }}
            key={index}
          >
            {messageData.text}
          </Typography>
        ))}
      </div>
      <Box>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <Textarea
              placeholder="메시지를 입력하세요"
              value={input}
              minRows={1}
              maxRows={2}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyDown}
              endDecorator={
                <Stack direction="row">
                  <Button
                    color="primary"
                    sx={{ alignSelf: "center", borderRadius: "sm" }}
                    endDecorator={<SendRoundedIcon />}
                    type="submit"
                  >
                    보내기
                  </Button>
                </Stack>
              }
            />
          </FormControl>
        </form>
      </Box>
    </Sheet>
  );
};

export default ChatRoom;
