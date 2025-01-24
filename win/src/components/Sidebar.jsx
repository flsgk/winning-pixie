import React from "react";
import { Link } from "react-router-dom"; // Link 컴포넌트 import
import {
  List,
  ListItem,
  ListItemButton,
  Box,
  Input,
  Typography,
  ListItemContent,
  Sheet,
} from "@mui/joy";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import Divider from "@mui/joy/Divider";

function Sidebar({ nickname, onTabChange }) {
  return (
    <Sheet
      sx={{
        width: 250,
        height: "100%",
        flexShrink: 0, // 사이드바가 화면 크기에 따라 축소되지 않도록 0으로 설정
        position: "fixed", // 사이드바 고정
        top: 0, // 화면 상단에 붙도록 설정
        left: 0, // 화면 왼쪽에 붙도록 설정
        borderRight: "0.5px solid",
        borderColor: "divider",
      }}
      variant="permanent" // 고정된 사이드바
      anchor="left"
    >
      <Typography
        level="title-md"
        sx={{
          padding: 2,
        }}
      >
        {nickname} 요정님
      </Typography>

      <Divider
        sx={{
          width: "230px", // 사이드바보다 조금 짧은 가로폭
          marginLeft: "auto", // 왼쪽 여백을 자동으로 설정하여 중앙 정렬
          marginRight: "auto", // 오른쪽 여백을 자동으로 설정하여 중앙 정렬
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Input
          size="sm"
          startDecorator={<SearchRoundedIcon />}
          placeholder="Search"
          sx={{
            marginTop: 2,
          }}
        />

        <List sx={{ width: "100%", paddingLeft: 2 }}>
          <ListItem>
            <ListItemButton component={Link} to="/">
              <HomeRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">홈</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => onTabChange("profile")}>
              <PersonRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">내 프로필</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => onTabChange("rate")}>
              <EmojiEventsRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">내 직관기록</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => onTabChange("chat-page")}>
              <QuestionAnswerRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">내 채팅</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton>
              <SettingsRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm">설정</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Sheet>
  );
}

export default Sidebar;
