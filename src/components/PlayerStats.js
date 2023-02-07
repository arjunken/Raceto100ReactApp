import { Box } from "@mui/material";
import ProfileCard from "./ProfileCard";

const PlayerStats = ({ currentUserData }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 3 }}>
      <ProfileCard contentType="Username" contentValue={currentUserData ? currentUserData.name : ""} bgcolorcode={0} />
      <ProfileCard contentType="Games Played" contentValue={currentUserData ? currentUserData.gamesPlayed : ""} bgcolorcode={2} />
      <ProfileCard contentType="Games Won" contentValue={currentUserData ? currentUserData.gamesWon : ""} bgcolorcode={4} />
      <ProfileCard contentType="Golds Earned" contentValue={currentUserData ? currentUserData.gold : ""} bgcolorcode={6} />
      <ProfileCard contentType="Diamonds Earned" contentValue={currentUserData ? currentUserData.diamond : ""} bgcolorcode={8} />
      <ProfileCard contentType="Total Score" contentValue={currentUserData ? currentUserData.totalScore : ""} bgcolorcode={3} />
      <ProfileCard contentType="Profile Picture" avatar={currentUserData ? currentUserData.avatarUrl : ""} bgcolorcode={5} />
    </Box>
  );
};

export default PlayerStats;
