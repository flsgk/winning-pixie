import React from "react";
import { Box } from "@mui/joy";

import Sidebar from "./Sidebar";
import MyProfile from "./MyProfile";

function MyPage({ nickname, selectedTeam }) {
  const sidebarWidth = 250; // 사이드바의 고정 너비

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          width: `${sidebarWidth}px`, // 사이드바의 고정된 너비
          flexShrink: 0, // 사이드바 크기 고정
        }}
      >
        {/* 고정된 사이드바 영역 */}
        <Sidebar nickname={nickname} /> {/* nickname을 Sidebar로 전달 */}
      </Box>
      <Box
        sx={{
          width: `calc(100% - ${sidebarWidth}px)`, // 전체 화면 너비에서 사이드바 너비를 뺀 값
          padding: 2, // 콘텐츠에 여백을 추가
          backgroundColor: "#f4f4f4",
          height: "100vh", // 콘텐츠 영역의 높이를 화면 전체로 설정
          overflowY: "auto", // 스크롤 추가
        }}
      >
        {/* 콘텐츠 영역 */}
        <MyProfile />
      </Box>
    </Box>
  );
}

export default MyPage;
