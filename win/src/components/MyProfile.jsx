import React, { useEffect, useState } from "react";
import {
  ref,
  get,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { auth, database } from "../firebase";
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
  FormHelperText,
} from "@mui/joy";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

function MyProfile() {
  const [profileData, setProfileData] = useState({
    fullname: "",
    nickname: "",
    selectedTeam: "",
    bio: "",
  });

  // 원래 프로필 데이터를 저장하는 상태
  const [originalProfileData, setOriginalProfileData] = useState({
    fullname: "",
    nickname: "",
    selectedTeam: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [isNicknameDuplicate, setIsNicknameDuplicate] = useState(false); // 중복 여부 상태 추가

  // 현재 사용자의 데이터 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("로그인이되지 않았습니다.");

        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileData(userData); // 사용자 데이터 상태로 설정
          setOriginalProfileData(userData); // 원래 프로필 데이터로 설정
        } else {
          console.error("사용자 데이터를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("사용자 데이터 로드 실패:", error.message);
      }
    };

    fetchUserData();
  }, []);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // 닉네임 중복 확인
  const checkNicknameDuplicate = async (nickname) => {
    try {
      const userRef = ref(database, "users");
      const q = query(userRef, orderByChild("nickname"), equalTo(nickname));
      const snapshot = await get(q);

      return snapshot.exists();
    } catch (error) {
      console.error("닉네임 중복 확인 실패 :", error.message);
      return false;
    }
  };

  // 프로필 업데이트
  const updateUserProfile = async (profileData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("로그인되지 않았습니다.");

      const userRef = ref(database, `users/${user.uid}`);
      await update(userRef, profileData);
      alert("프로필이 성공적으로 업데이트되었습니다.");
    } catch (error) {
      console.error("프로필 저장 실패:", error.message);
      alert("프로필 저장에 실패했습니다.");
    }
  };

  // 닉네임 중복 여부에 따른 프로필 저장 실행
  const handleSave = async () => {
    // 닉네임 중복 확인
    const isNicknameDuplicate = await checkNicknameDuplicate(
      profileData.nickname
    );
    if (isNicknameDuplicate) {
      setError("이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.");
      setIsNicknameDuplicate(true); // 닉네임 중복 상태 true로 설정
      return;
    }
    // 중복되지 않으면 프로필 저장
    setError(""); // 에러 메시지 초기화
    setIsNicknameDuplicate(false); // 닉네임 중복 상태 false로 설정
    await updateUserProfile(profileData);
  };

  // 취소 버튼 클릭 시 원래 값으로 되돌리기 및 에러 상태 초기화
  const handleCancel = () => {
    setError(""); // 에러 초기화
    setProfileData(originalProfileData); // 화면에서 원래 데이터로 돌리기
    setIsNicknameDuplicate(false); // 닉네임 중복 상태 false로 초기화
  };

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
                <Input
                  name="fullname" // name 속성 추가
                  size="sm"
                  placeholder="이름을 입력해주세요."
                  value={profileData.fullname}
                  onChange={handleChange}
                />
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <FormLabel>닉네임</FormLabel>
              <FormControl error={isNicknameDuplicate}>
                <Input
                  name="nickname" // name 속성 추가
                  size="sm"
                  placeholder="닉네임을 입력해주세요."
                  value={profileData.nickname}
                  onChange={handleChange}
                />
                {isNicknameDuplicate && (
                  <FormHelperText>
                    <InfoOutlined />
                    이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.
                  </FormHelperText>
                )}
              </FormControl>
            </Stack>
            <Stack spacing={1}>
              <FormLabel>응원하는 팀</FormLabel>
              <FormControl>
                <Select
                  name="selectedTeam"
                  value={profileData.selectedTeam}
                  onChange={(e, value) =>
                    setProfileData((prev) => ({ ...prev, selectedTeam: value }))
                  }
                  placeholder="선택"
                >
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
                  value={profileData.bio}
                  onChange={handleChange}
                  inputProps={{ maxLength: 50 }}
                  name="bio" // name 속성 추가
                />
              </FormControl>
            </Stack>
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button size="sm" variant="solid" onClick={handleSave}>
                저장
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={handleCancel}
              >
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
