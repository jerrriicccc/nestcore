import React, { useEffect, useRef } from "react";
import { Box, Toolbar, useMediaQuery, useTheme, Drawer } from "@mui/material";
import Sidebar from "./Sidebar";
import AppBar from "./AppBar";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const drawerRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isSmallScreen && isDrawerOpen) {
      setIsDrawerOpen(false);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedOutsideDrawer = drawerRef.current && !drawerRef.current.contains(target);
      const clickedOutsideToggle = toggleButtonRef.current && !toggleButtonRef.current.contains(target);

      if (isDrawerOpen && clickedOutsideDrawer && clickedOutsideToggle) {
        setIsDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar toggleDrawer={toggleDrawer} toggleButtonRef={toggleButtonRef} />
      <Drawer ref={drawerRef} sx={{ flexShrink: 0 }} variant="persistent" anchor="left" open={isDrawerOpen}>
        <Sidebar />
      </Drawer>

      {isDrawerOpen && (
        <Box
          onClick={toggleDrawer}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(.5px)",
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        />
      )}

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        {children}
        <div className="p-4">
          <Footer />
        </div>
      </Box>
    </Box>
  );
}
