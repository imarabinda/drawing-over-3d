import { Box, Typography } from "@mui/material";
import { forwardRef } from "react";
import LoadingScene from "./LoadingScene";
import ModernLinearProgressBar from "./ModernLinearProgressBar";

const LoadingScene3D = forwardRef<HTMLDivElement, {}>(function LoadingScene3D(
  props,
  ref
) {
  return (
    <LoadingScene
      ref={ref}
      alignItems={"center"}
      gap={2}
      justifyContent={"center"}
      {...props}
    >
      <Typography fontWeight={"bold"}>Loading</Typography>
      <Box
        component="div"
        sx={{
          width: "40%",
        }}
      >
        <ModernLinearProgressBar variant="determinate" value={0} color="info" />
      </Box>
    </LoadingScene>
  );
});
export default LoadingScene3D;
