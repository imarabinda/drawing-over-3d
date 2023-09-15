import { Stack, styled } from "@mui/material";

const LoadingScene = styled(Stack)`
  position: absolute;
  width: 100%;
  height: 100%;
  background: black;
  display: flex;
  z-index: ${({ theme }) => theme.zIndex.appBar + 1};
  user-select: none;
`;

export default LoadingScene;
