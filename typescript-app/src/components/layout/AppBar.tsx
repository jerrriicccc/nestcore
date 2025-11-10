import { useState } from "react";
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import Profile from "../../assets/images/profile.png";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import Badge from "@mui/material/Badge";
import { clearToken } from "../../lib/token-service";

interface AppBarProps {
  toggleDrawer: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export default function AppBar({ toggleDrawer, toggleButtonRef }: AppBarProps) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleChangePassword = () => {
    handleMenuClose();
    navigate("/reset-password");
  };

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };
  const location = useLocation();
  const currentPath = location.pathname;

  const navItemStyle = (path: string) => ({
    flexGrow: 1,
    cursor: "pointer",
    color: currentPath === path ? "black" : "white",
    "&:hover": {
      color: "black",
    },
  });

  return (
    <MuiAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar
        sx={{
          // backgroundImage: "linear-gradient(to right, #036093, #0484b3)",
          backgroundColor: "#494949",
          color: "white",
        }}
      >
        <IconButton color="inherit" edge="start" onClick={toggleDrawer} ref={toggleButtonRef}>
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          sx={{
            flexGrow: 1,
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: "bold",
            fontStyle: "italic",
            letterSpacing: "1px",
            // color: "",
          }}
        >
          NEST CORE
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton sx={{ p: 0 }} onClick={handleMenuClick} aria-controls={open ? "account-menu" : undefined} aria-haspopup="true" aria-expanded={open ? "true" : undefined}>
            <Avatar src={Profile} />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: "white",
                color: "black",
                width: 220,
              },
            }}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleChangePassword}>Change Password</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
