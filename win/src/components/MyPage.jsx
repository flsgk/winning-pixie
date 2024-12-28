import React from "react";
import { Typography, Box } from "@mui/joy";

function MyPage({ nickname, selectedTeam }) {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography level="h2">마이페이지</Typography>
      <Typography level="body1">닉네임: {nickname}</Typography>
      <Typography level="body1">선택된 팀: {selectedTeam}</Typography>
    </Box>
  );
}

export default MyPage;
