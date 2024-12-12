// StyledComponents.js
import { styled } from "@mui/material/styles";
import MuiCard from "@mui/material/Card";
import Stack from "@mui/material/Stack";

// Card 컴포넌트를 스타일링하여 export
export const Card = styled(MuiCard)(({ theme }) => ({
  padding: theme.spacing(2),
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(3),
}));

// SignUpContainer 컴포넌트 스타일링
export const SignUpContainer = styled(Stack)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
}));
