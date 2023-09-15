import ModernCircularProgress from "./ModernCircularProgress";
import { StackProps, Typography } from "@mui/material";
import LoadingScene from "./LoadingScene";
import { forwardRef } from "react";

type DefaultCircleLoaderProps = StackProps & {
  hideText?: boolean;
};
const DefaultCircleLoader = forwardRef<
  HTMLDivElement,
  DefaultCircleLoaderProps
>(function DefaultCircleLoader(props, ref) {
  const { hideText, ...rest } = props;
  return (
    <LoadingScene
      alignItems={"center"}
      gap={1}
      justifyContent={"center"}
      direction={"column"}
      {...rest}
      ref={ref}
    >
      <ModernCircularProgress />
      {!hideText ? <Typography fontWeight={"bold"}>Loading</Typography> : null}
    </LoadingScene>
  );
});
export default DefaultCircleLoader;
