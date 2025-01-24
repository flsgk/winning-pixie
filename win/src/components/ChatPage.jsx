import React, { useState } from "react";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom"; // ChatRoom 컴포넌트 임포트

const ChatPage = () => {
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);

  const handleChatRoomSelect = (chatRoomData) => {
    const { roomId, postId } = chatRoomData;

    console.log("Selected roomId:", roomId);
    console.log("Selected postId:", postId);

    setSelectedChatRoom({ roomId, postId });
  };

  return (
    <div>
      <ChatList onSelectedChatRoom={handleChatRoomSelect} />

      {selectedChatRoom ? (
        <ChatRoom
          id={selectedChatRoom?.postId} // id 전달
          roomId={selectedChatRoom?.roomId} // roomId 전달
        />
      ) : (
        "채팅방을 선택해 주세요."
      )}
    </div>
  );
};

export default ChatPage;
