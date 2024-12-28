import React from "react";
import { Box } from "@mui/joy";

import Sidebar from "./Sidebar";

function MyPage({ nickname, selectedTeam }) {
  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      {/* 고정된 사이드바 영역 */}
      <Sidebar nickname={nickname} /> {/* nickname을 Sidebar로 전달 */}
      {/* 콘텐츠 영역 */}
    </Box>
  );
}

export default MyPage;
