import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, LinearProgress, Alert, Button } from "@mui/material";
import { setToken } from "../../lib/token-service";
import { APIURL } from "../../lib/constants";
import { useAuth } from "../../context/AuthContext";
import bivmclogo from "../../assets/images/bivmc_logo.png";

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (hasProcessed) return;

    const handleCallback = async () => {
      try {
        setHasProcessed(true);

        const token = searchParams.get("token");
        if (token) {
          setError("Your GitHub account has been successfully linked! Redirecting…");
          setTimeout(() => navigate("/dashboard"), 3000);
          setLoading(false);
          return;
        }

        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
          setError(`GitHub OAuth error: ${error}`);
          setLoading(false);
          return;
        }

        if (!code) {
          setError("Authorization code not received from GitHub");
          setLoading(false);
          return;
        }

        const storedState = sessionStorage.getItem("github_oauth_state");
        if (state && storedState && state !== storedState) {
          setError("Invalid state parameter - possible CSRF attack");
          setLoading(false);
          return;
        }

        const response = await fetch(`${APIURL}/auth/requesttokenis`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ code, state: state || undefined }),
        });

        const data = await response.json();

        if (response.ok && data.status === "success" && data.data?.access_token) {
          setToken(data.data.access_token, data.data.rbac_tokens || {});
          await checkAuthStatus();
          sessionStorage.removeItem("github_oauth_state");

          navigate("/dashboard", { replace: true });
        } else {
          if (response.status === 401 && data.error === "User not found") {
            setError(`No account found with this GitHub email (${data.details?.githubEmail}). Please register first or contact your administrator.`);
          } else {
            setError(data.error || "Failed to exchange code for token");
          }
        }
      } catch (err) {
        console.error("GitHub callback error:", err);
        setError("An error occurred during GitHub authentication");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, hasProcessed]);

  // ======================================================================
  // ⭐ LOADING SCREEN — NOW WITH DARK STEEL THEME (#494949 + variants)
  // ======================================================================
  if (loading) {
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
            background: "rgba(73, 73, 73, 0.35)", // darker glass
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "white",
            animation: "fadeUp 1s ease",
          }}
        >
          {/* LOGO */}
          <img
            src={bivmclogo}
            alt="Logo"
            style={{
              width: "120px",
              marginBottom: "25px",
              animation: "pulse 2s infinite ease-in-out",
            }}
          />

          {/* TEXT */}
          <Typography variant="body1" sx={{ fontWeight: "bold", mt: 3, letterSpacing: 0.5 }}>
            Authorizing…
          </Typography>

          {/* BRANDED PROGRESS BAR */}
          <LinearProgress
            sx={{
              height: 6,
              borderRadius: 5,
              backgroundColor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#6d6d6d", // lighter steel color
              },
            }}
          />
        </Box>

        {/* KEYFRAMES + THEME */}
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
  }

  // ======================================================================
  // ERROR SCREEN
  // ======================================================================
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        background: "#1a1a1a",
      }}
    >
      {error && (
        <Alert
          severity="error"
          sx={{
            maxWidth: 450,
            background: "#2e2e2e",
            color: "white",
            border: "1px solid #494949",
          }}
        >
          {error}
          <Box mt={2}>
            <Button variant="contained" onClick={() => navigate("/")}>
              Return to Login
            </Button>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default GitHubCallback;
