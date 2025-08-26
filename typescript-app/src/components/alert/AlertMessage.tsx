import { useEffect, useState } from "react";
import MuiAlert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Slide from "@mui/material/Slide";

type AlertSeverity = "success" | "error" | "warning" | "info";

interface AlertMessagesProps {
  severity: AlertSeverity;
  title: string;
  message: string;
  alertKey?: number;
}

const CustomAlert = styled(MuiAlert)<{ severity: AlertSeverity }>(({ severity }) => ({
  background:
    severity === "success"
      ? "linear-gradient(to right, #0484b3, #036093)"
      : severity === "error"
        ? "linear-gradient(to right, #c00404, #930101)"
        : severity === "warning"
          ? "linear-gradient(to right, #ffb74d, #ff9800)"
          : "linear-gradient(to right, #64b5f6, #2196f3)",
  color: "#fff",
  "& .MuiAlert-icon": {
    color: "#fff",
  },
}));

export const AlertMessages = ({ severity, title, message, alertKey }: AlertMessagesProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(true); // Reset open state when alertKey changes
  }, [alertKey]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setOpen(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Stack
      sx={{
        width: "auto",
        minWidth: "300px",
        maxWidth: "400px",
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
      }}
      spacing={2}
    >
      <Slide in={open} direction="left" mountOnEnter unmountOnExit>
        <div>
          <CustomAlert severity={severity} onClose={() => setOpen(false)}>
            <AlertTitle>{title}</AlertTitle>
            {message}
          </CustomAlert>
        </div>
      </Slide>
    </Stack>
  );
};

export default AlertMessages;
