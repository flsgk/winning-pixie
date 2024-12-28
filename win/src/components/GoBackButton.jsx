import React from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/joy/IconButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

function GoBackButton() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <IconButton
      onClick={handleBackClick}
      color="neutral"
      sx={{
        marginBottom: 2, // 버튼 아래에 여백
        marginTop: 2,
        alignSelf: "flex-start",
      }}
    >
      <ArrowBackIosIcon />
    </IconButton>
  );
}

export default GoBackButton;
