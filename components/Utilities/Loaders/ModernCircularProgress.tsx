import {
  CircularProgress,
  CircularProgressProps,
  circularProgressClasses,
  styled,
  Stack,
  Fade,
} from "@mui/material";
const Container = styled(Stack)`
  position: relative;
`;
const CircularProgressBase = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
}));
const CircularProgressRotate = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
  animationDuration: "550ms",
  position: "absolute",
  left: 0,
  [`& .${circularProgressClasses.circle}`]: {
    strokeLinecap: "round",
  },
}));

export default function ModernCircularProgress(props: CircularProgressProps) {
  return (
    <Container direction={"row"} justifyContent="center" alignItems={"center"}>
      <CircularProgressBase
        variant="determinate"
        thickness={4}
        {...props}
        value={100}
      />
      <Fade in={true} mountOnEnter unmountOnExit>
        <CircularProgressRotate
          variant={"indeterminate"}
          disableShrink
          thickness={4}
          {...props}
        />
      </Fade>
    </Container>
  );
}
