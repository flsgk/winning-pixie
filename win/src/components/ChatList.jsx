import { Box, Button, ButtonGroup, Card, Typography } from "@mui/joy";
import { getAuth } from "firebase/auth";
import { equalTo, get, orderByChild, query, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import ChatRoom from "./ChatRoom";
import { useNavigate } from "react-router-dom";

const ChatList = ({ onSelectedChatRoom }) => {
  const [chatAuthor, setChatAuthor] = useState([]);
  const [chatApplicant, setChatApplicant] = useState([]);
  const [isWhoFilter, setIsWhoFilter] = useState("");
  const [selectedTab, setSelectedTab] = useState("author"); // 기본 값은 글 주인으로 설정
  // const [selectedChat, setSelectedChat] = useState(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const currentUserUid = currentUser.uid;
  const navigate = useNavigate();

  // 일단 내가 주인인 채팅만 가져올 수 있는지 확인
  useEffect(() => {
    if (!currentUser) return;

    const fetchChatRoomsByAuthorUid = async () => {
      const chatRoomsRef = ref(database, "chatRooms");
      const authorUidQuery = query(
        chatRoomsRef,
        orderByChild("authorUid"),
        equalTo(currentUserUid)
      );

      try {
        const snapshot = await get(authorUidQuery);
        if (snapshot.exists()) {
          const chatRooms = snapshot.val();

          // 객체를 배열로 변환
          const chatRoomsArray = Object.entries(chatRooms).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );

          setChatAuthor(chatRoomsArray); // 상태에 배열 저장
        } else {
          console.log("No chat rooms found for the current user.");
          setChatAuthor([]);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };

    const fetchChatRoomsByApplicantUid = async () => {
      const chatRoomsRef = ref(database, "chatRooms");
      const applicantUidQuery = query(
        chatRoomsRef,
        orderByChild("applicantUid"),
        equalTo(currentUserUid)
      );

      try {
        const snapshot = await get(applicantUidQuery);
        if (snapshot.exists()) {
          const chatRooms = snapshot.val();

          // 객체를 배열로 변환
          const chatRoomsArray = Object.entries(chatRooms).map(
            ([key, value]) => ({
              id: key,
              ...value,
            })
          );

          setChatApplicant(chatRoomsArray); // 상태에 배열 저장
        } else {
          console.log("No chat rooms found for the current user.");
          setChatApplicant([]);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      }
    };

    fetchChatRoomsByAuthorUid();
    fetchChatRoomsByApplicantUid();
  }, [currentUser]);

  console.log("chatAuthor:", chatAuthor);
  console.log("chatApplicant:", chatApplicant);

  return (
    <>
      <ButtonGroup>
        <Button onClick={() => setSelectedTab("author")}>내가 채팅 주인</Button>
        <Button onClick={() => setSelectedTab("applicant")}>내가 참여자</Button>
      </ButtonGroup>

      {selectedTab === "author" && (
        <>
          {chatAuthor.length > 0 ? (
            chatAuthor.map((chat, index) => (
              <Card
                key={index}
                onClick={() =>
                  onSelectedChatRoom({
                    roomId: chat.roomId,
                    postId: chat.postId,
                  })
                }
                sx={{
                  width: "300px",
                  height: "100px",
                }}
              >
                <Typography>룸 아이디 :{chat.roomId}</Typography>
                <Typography>글 아이디 :{chat.postId}</Typography>
                <p>{chat.applicantNickname + "님"}</p>
                {chat.messages ? (
                  (() => {
                    // 키 배열을 정렬하고 마지막 키 가져오기
                    const messageKeys = Object.keys(chat.messages);
                    const lastMessageKey = messageKeys[messageKeys.length - 1];
                    const lastMessage = chat.messages[lastMessageKey];

                    return (
                      <div key={lastMessageKey}>
                        <p>
                          {lastMessage.sender === currentUserUid
                            ? "나"
                            : lastMessage.senderNickname + "님"}
                          : {lastMessage.text}
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p>no message</p>
                )}
              </Card>
            ))
          ) : (
            <p></p>
          )}
        </>
      )}

      {selectedTab === "applicant" && (
        <>
          {chatApplicant.length > 0 ? (
            chatApplicant.map((chat, index) => (
              <Card
                key={index}
                onClick={() =>
                  onSelectedChatRoom({
                    roomId: chat.roomId,
                    postId: chat.postId,
                  })
                }
                sx={{
                  width: "300px",
                  height: "600px",
                }}
              >
                <Typography>룸 아이디 :{chat.roomId}</Typography>
                <Typography>글 아이디 :{chat.postId}</Typography>
                <p>{chat.authorNickname + "님"}</p>
                {chat.messages ? (
                  (() => {
                    // 키 배열을 정렬하고 마지막 키 가져오기
                    const messageKeys = Object.keys(chat.messages);
                    const lastMessageKey = messageKeys[messageKeys.length - 1];
                    const lastMessage = chat.messages[lastMessageKey];

                    return (
                      <div key={lastMessageKey}>
                        <p>
                          {lastMessage.sender === currentUserUid
                            ? "나"
                            : lastMessage.senderNickname + "님"}
                          : {lastMessage.text}
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p>no message</p>
                )}
              </Card>
            ))
          ) : (
            <p></p>
          )}
        </>
      )}
    </>
  );
};

export default ChatList;
