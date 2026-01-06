import { Typography, Box, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { DashboardItems } from "./Sidebar";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DetailsIcon from "@mui/icons-material/Details";
import SearchIcon from "@mui/icons-material/Search";

import { useTitle } from "../../context/TitleContext";
import { useEffect } from "react";

function getTitle(pathname: string): string {
  for (const item of DashboardItems) {
    if (item.link === pathname) return item.caption;
    if (item.children) {
      const match = item.children.find((child) => child.link === pathname);
      if (match) return match.caption;
    }
  }
  return "";
}

interface NavButtons {
  label: string;
  type: string;
  url?: string;
  name?: string;
}

interface SubHeaderProps {
  title?: string;
  buttons?: NavButtons[];
  searchPane?: React.ReactNode;
  actions?: Record<string, () => void>;
  filterButton?: React.ReactNode;
}

export default function SubHeader({ buttons = [], searchPane, title = "", actions = {}, filterButton = true }: SubHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setExplicitTitle } = useTitle();
  const ptitle = title || getTitle(location.pathname);

  useEffect(() => {
    if (title) {
      setExplicitTitle(title);
    }
  }, [title, setExplicitTitle]);

  const handleButtonClick = (button: NavButtons) => {
    if (button.name && actions[button.name]) {
      actions[button.name]!();
      return;
    }

    if (button.type === "link" && button.url) {
      navigate(button.url);
    }
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" sx={{ minHeight: 64 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}>
          {ptitle}
        </Typography>

        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          {filterButton}
          {searchPane}
          {buttons.map((btn, idx) => (
            <Button
              key={idx}
              variant="contained"
              className="btn-primary"
              onClick={() => handleButtonClick(btn)}
              sx={{ borderRadius: 5, px: 2, display: "flex", alignItems: "center", justifyContent: "center" }}
              startIcon={
                btn.name === "btnBack" ? (
                  <ArrowLeftIcon />
                ) : btn.name === "btnCreate" ? (
                  <AddCircleOutlineIcon />
                ) : btn.name === "btnAccessDet" ? (
                  <DetailsIcon />
                ) : btn.name === "btnTglSearch" ? (
                  <SearchIcon />
                ) : null
              }
            >
              {btn.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
