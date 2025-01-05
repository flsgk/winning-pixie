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
  Divider,
} from "@mui/joy";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { da } from "date-fns/locale";
import GoBackButton from "./GoBackButton";

const socket = io("http://localhost:4000"); // 여기에서 4000번 포트를 확인

const ChatRoom = () => {
  const { roomId } = useParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chatRoomInfo, setChatRoomInfo] = useState(null);

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

    // 체팅방 정보 가져오기
    const chatRoomRef = ref(database, `chatRooms/${roomId}`);
    onValue(chatRoomRef, (snapshot) => {
      if (snapshot.exists()) {
        setChatRoomInfo(snapshot.val());
      } else {
        console.error("채팅방 정보를 찾을 수 없습니다.");
      }
    });

    // 컴포넌트 언마운트 시 clean up
    return () => {
      socket.emit("leave room", roomId); // 채팅방을 떠날 때
      socket.off("chat message"); // 메시지 수신 이벤트 해제
      off(chatRoomRef);
    };
  }, [roomId]);

  // 메시지 전송
  const sendMessage = () => {
    if (input) {
      const user = auth.currentUser;

      if (user) {
        const senderNickname =
          currentUserId === chatRoomInfo.authorUid
            ? chatRoomInfo.authorNickname
            : chatRoomInfo.applicantUid;

        const messageData = {
          roomId,
          text: input,
          sender: currentUserId,
          senderNickname: senderNickname,
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

  // 채팅 메시지 시간 표시

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return " ";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <GoBackButton />
      <Typography>{roomId}</Typography>
      <Divider />

      {messages.map((messageData, index) => (
        <Box
          sx={{
            marginBottom: 1, // 각 메시지 간의 세로 간격을 줄이기 위해 marginBottom을 추가
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems:
                messageData.sender === currentUserId
                  ? "flex-end"
                  : "flex-start",
            }}
            key={index}
          >
            <Typography level="body-xs">
              {messageData.sender === currentUserId
                ? "나"
                : messageData.senderNickname + "님"}
            </Typography>
            <Sheet
              sx={{
                p: 1.25,
                borderRadius: "lg",
                fontSize: "sm",

                textAlign:
                  messageData.sender === currentUserId ? "right" : "left",
                borderTopRightRadius:
                  messageData.sender === currentUserId ? 0 : "lg",
                borderTopLeftRadius:
                  messageData.sender === currentUserId ? "lg" : 0,
                backgroundColor:
                  messageData.sender === currentUserId
                    ? "var(--joy-palette-primary-solidBg)"
                    : "var(--joy-palette-neutral-100, #F0F4F8)",
                display: "inline-block", // 부모 요소의 크기가 자식의 콘텐츠에 맞춰 조정됨
                wordBreak: "break-word", // 긴 단어가 넘칠 경우 줄 바꿈
                maxWidth: "60%", // 메시지 길이에 맞게 최대 너비를 설정 (여기서는 70%로 설정, 필요에 따라 조정)
              }}
            >
              <Typography
                level="body-sm"
                sx={{
                  color:
                    messageData.sender === currentUserId
                      ? "var(--joy-palette-common-white)"
                      : "var(--joy-palette-text-primary)",
                }}
              >
                {messageData.text}
              </Typography>
            </Sheet>
            <Typography level="body-xs">
              {formatTimestamp(messageData.timestamp)}
            </Typography>
          </Box>
        </Box>
      ))}

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
    </Box>
  );
};

export default ChatRoom;
