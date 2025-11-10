import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        padding: 2,
        marginTop: "auto",
        textAlign: "center",
        backgroundColor: "#494949",
        color: "#ffffff",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontStyle: "italic",
        }}
      >
        © {new Date().getFullYear()} <span style={{ fontFamily: '"Times New Roman", Times, serif', fontStyle: "italic" }}>NEST CORE</span>. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
