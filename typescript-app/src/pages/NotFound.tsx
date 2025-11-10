import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/dashboard");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 2,
          py: 2,
        }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 120,
            color: "#494949",
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "4rem", md: "6rem" },
            fontWeight: "bold",
            color: "#494949",
            fontFamily: '"Times New Roman", Times, serif',
            letterSpacing: "2px",
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#494949",
            fontFamily: '"Times New Roman", Times, serif',
            fontStyle: "italic",
            // mb: 1,
          }}
        >
          NEST CORE
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: "#666",
            // mb: 1,
          }}
        >
          Page Not Found
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={handleGoHome}
            startIcon={<HomeIcon />}
            sx={{
              backgroundColor: "#494949",
              "&:hover": {
                backgroundColor: "#333",
              },
              fontWeight: "bold",
              px: 3,
              py: 1.5,
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            onClick={handleGoBack}
            sx={{
              borderColor: "#494949",
              color: "#494949",
              "&:hover": {
                borderColor: "#333",
                color: "#333",
                backgroundColor: "rgba(73, 73, 73, 0.04)",
              },
              fontWeight: "bold",
              px: 3,
              py: 1.5,
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
