import React from "react";
import {
  Stack,
  Typography,
  Card,
  Box,
  Divider,
  FormLabel,
  FormControl,
  Input,
  Select,
  Option,
  CardOverflow,
  CardActions,
  Button,
} from "@mui/joy";

function MyProfile() {
  return (
    <Stack>
      <Typography level="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
        내 프로필
      </Typography>
      <Divider />
      <Stack
        sx={{
          display: "flex",
          width: 800,
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 1, md: 2 },
        }}
      >
        <Card>
          <Box>
            <Typography level="title-md">내 정보</Typography>
            <Typography level="body-sm">
              프로필 정보를 작성해 주세요.
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ flexGrow: 1 }}>
            <Stack spacing={1}>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input size="sm" placeholder="이름을 입력해주세요." />
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <FormLabel>닉네임</FormLabel>
              <FormControl>
                <Input size="sm" placeholder="닉네임을 입력해주세요." />
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <FormLabel>응원하는 팀</FormLabel>
              <FormControl>
                <Select>
                  <Option value="choice">선택</Option>
                  <Option value="두산">두산</Option>
                  <Option value="LG">LG</Option>
                  <Option value="KIA">KIA</Option>
                  <Option value="NC">NC</Option>
                  <Option value="KT">KT</Option>
                  <Option value="한화">한화</Option>
                  <Option value="삼성">삼성</Option>
                  <Option value="키움">키움</Option>
                  <Option value="SSG">SSG</Option>
                  <Option value="롯데">롯데</Option>
                </Select>
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <FormLabel>한 줄 소개</FormLabel>
              <FormControl>
                <Input
                  size="sm"
                  placeholder="50자 이내로 작성해주세요."
                  onChange={(e) => {
                    if (e.target.value.length > 50) {
                      e.target.value = e.target.value.slice(0, 50); // 10자 초과 시 잘라내기
                    }
                  }}
                />
              </FormControl>
            </Stack>
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button size="sm" variant="solid">
                저장
              </Button>
              <Button size="sm" variant="outlined" color="neutral">
                취소
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </Stack>
  );
}

export default MyProfile;
