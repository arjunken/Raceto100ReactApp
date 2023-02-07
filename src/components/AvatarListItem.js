import { Avatar, Box, Button } from "@mui/material";

const AvatarListItem = ({ item, index, selectedAvatar, avatarClickHandler }) => {
  return (
    <Box>
      {index === selectedAvatar ? (
        <Button sx={{ "&:hover": { backgroundColor: "lightblue" }, backgroundColor: "lightblue" }}>
          <Avatar alt="avatar" src={item} sx={{ width: 60, height: 60, borderRadius: "50px" }} variant="rounded" />
        </Button>
      ) : (
        <Button sx={{ "&:hover": { backgroundColor: "lightblue" } }} onClick={() => avatarClickHandler(index, item)}>
          <Avatar alt="avatar" src={item} sx={{ width: 60, height: 60, borderRadius: "50px" }} variant="rounded" />
        </Button>
      )}
    </Box>
  );
};

export default AvatarListItem;
