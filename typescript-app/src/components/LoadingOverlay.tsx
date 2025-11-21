import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import bivmclogo from "../assets/images/bivmc_logo.png";

interface LoadingOverlayProps {
  title?: string;
  progressLabel?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ title = "Authorizing…", progressLabel = "" }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        top: 0,
        left: 0,
        background: "linear-gradient(135deg, var(--bivmc-bg1), var(--bivmc-bg2))",
        textAlign: "center",
        zIndex: 9999,
        animation: "fadeIn 0.8s ease",
      }}
    >
      <Box
        sx={{
          p: 5,
          width: 360,
          borderRadius: "22px",
          background: "rgba(73, 73, 73, 0.35)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "white",
          animation: "fadeUp 1s ease",
        }}
      >
        <img
          src={bivmclogo}
          alt="Logo"
          style={{
            width: "120px",
            marginBottom: "25px",
            animation: "pulse 2s infinite ease-in-out",
          }}
        />

        <Typography variant="body1" sx={{ fontWeight: "bold", mt: 3, letterSpacing: 0.5 }}>
          {title}
        </Typography>

        <LinearProgress
          sx={{
            height: 6,
            borderRadius: 5,
            backgroundColor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#6d6d6d",
            },
            mt: 2,
          }}
        />
      </Box>

      <style>
        {`
          :root {
            --bivmc-bg1: #1a1a1a;
            --bivmc-bg2: #494949;
          }

          @media (prefers-color-scheme: dark) {
            :root {
              --bivmc-bg1: #0f0f0f;
              --bivmc-bg2: #2e2e2e;
            }
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.08); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoadingOverlay;
