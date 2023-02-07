import { Box, Button, InputLabel, Slider, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

const PlayOptions = (props) => {
  const [targetScore, setTargetScore] = useState(localStorage.getItem("raceto100Target"));
  const handleTargetScore = (e) => {
    localStorage.setItem("raceto100Target", e.target.value);
    setTargetScore(e.target.value);
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          border: 1,
          alignItems: "center",
          gap: 1,
          flexDirection: "column",
          backgroundColor: "#f8f9fa",
          p: 2,
        }}
      >
        <InputLabel>Game Mode</InputLabel>
        <Box>
          <ToggleButtonGroup
            id="gameMode"
            name="gameMode"
            color="secondary"
            value={props.mode}
            exclusive
            onChange={props.options}
            aria-label="Platform"
          >
            <ToggleButton value="1">Single Player</ToggleButton>
            <ToggleButton value="2">Remote Players</ToggleButton>
            {props.goBtnAction && (
              <Button type="submit" variant="contained" onClick={props.goBtnAction} style={{ marginLeft: "10px" }}>
                Go
              </Button>
            )}
          </ToggleButtonGroup>
        </Box>

        <InputLabel> Target: {targetScore} </InputLabel>
        <Slider
          aria-label="GameTarget"
          key={`slider-${targetScore}`}
          defaultValue={Number(targetScore ? targetScore : 100)}
          onChange={handleTargetScore}
          valueLabelDisplay="auto"
          step={10}
          marks
          min={10}
          max={200}
        />
      </Box>
    </>
  );
};

export default PlayOptions;
