import {
  LinearProgress,
  LinearProgressProps,
  linearProgressClasses,
  styled,
} from "@mui/material";
import { forwardRef } from "react";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
    },
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
  },
}));
interface ModernLinearProgressBarProps extends LinearProgressProps {}
const ModernLinearProgressBar = forwardRef<any, ModernLinearProgressBarProps>(
  (props, ref) => {
    return <BorderLinearProgress {...props} ref={ref} />;
  }
);
ModernLinearProgressBar.displayName = "ModernLinearProgressBar";
export default ModernLinearProgressBar;
