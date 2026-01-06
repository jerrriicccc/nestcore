import React, { useState } from "react";
import { Drawer, List, ListItemButton, ListItemText, Collapse, Box } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import PeopleIcon from "@mui/icons-material/People";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { clearToken } from "../../lib/token-service";
import { useNavigate } from "react-router-dom";

export interface SidebarItem {
  link: string;
  caption: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
  isAction?: boolean; // Add flag for action items
}

export const DashboardItems: SidebarItem[] = [{ link: "/dashboard", caption: "Dashboard", icon: <DashboardIcon /> }];
export const ReportItems: SidebarItem[] = [{ link: "/reportlist", caption: "Report" }];
export const bookingMenuItems: SidebarItem[] = [
  { link: "/appointmentlist", caption: "List", icon: <FormatListBulletedIcon /> },
  { link: "/appointmentworkflowsetting/create", caption: "Workflow ", icon: <FormatListBulletedIcon /> },
  { link: "/servicesettinghome", caption: "Settings", icon: <FormatListBulletedIcon /> },
];
export const servicesMenuItems: SidebarItem[] = [{ link: "/servicesettinghome", caption: "Home", icon: <FormatListBulletedIcon /> }];
export const workflowMenuItems: SidebarItem[] = [{ link: "/statuses/create", caption: "Status", icon: <FormatListBulletedIcon /> }];

export const userMenuItems: SidebarItem[] = [
  { link: "/userlist", caption: "Users", icon: <PeopleIcon /> },
  { link: "/rolelist", caption: "Roles", icon: <ManageAccountsIcon /> },
];

export const accountMenuItems: SidebarItem[] = [
  { link: "/switchrole/update", caption: "Switch Role", icon: <PeopleIcon /> },
  { link: "logout", caption: "Logout", icon: <ManageAccountsIcon />, isAction: true },
];

const drawerWidth = 240; // Sidebar width
const appBarHeight = 56; // AppBar height

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggle = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  const renderMenuItem = (item: SidebarItem) => {
    // Handle logout action separately
    if (item.isAction && item.link === "logout") {
      return (
        <ListItemButton key={item.link} onClick={handleLogout}>
          <Box display="flex" alignItems="center" gap={1}>
            {item.icon}
            <ListItemText primary={item.caption} />
          </Box>
        </ListItemButton>
      );
    }

    // Regular link items
    return (
      <ListItemButton key={item.link} component={Link} to={item.link} selected={location.pathname === item.link}>
        <Box display="flex" alignItems="center" gap={1}>
          {item.icon}
          <ListItemText primary={item.caption} />
        </Box>
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#494949",
          color: "white",
          marginTop: `${appBarHeight}px`,
          height: `calc(100% - ${appBarHeight}px)`,
        },
      }}
    >
      <List component="nav">
        {DashboardItems.map((item) => renderMenuItem(item))}

        {/* Appointment  */}
        <ListItemButton onClick={() => handleToggle("bookinglist")}>
          <ListItemText primary="Appointment" />
          {openMenus["bookinglist"] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenus["bookinglist"]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {bookingMenuItems.map((subItem) => (
              <ListItemButton key={subItem.link} sx={{ pl: 4 }} component={Link} to={subItem.link} selected={location.pathname === subItem.link}>
                <Box display="flex" alignItems="center" gap={1}>
                  {subItem.icon}
                  <ListItemText primary={subItem.caption} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {ReportItems.map((item) => renderMenuItem(item))}

        {/* System Users */}
        <ListItemButton onClick={() => handleToggle("users")}>
          <ListItemText primary="System" />
          {openMenus["users"] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenus["users"]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {userMenuItems.map((subItem) => (
              <ListItemButton key={subItem.link} sx={{ pl: 4 }} component={Link} to={subItem.link} selected={location.pathname === subItem.link}>
                <Box display="flex" alignItems="center" gap={1}>
                  {subItem.icon}
                  <ListItemText primary={subItem.caption} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Accounts  */}
        <ListItemButton onClick={() => handleToggle("accounts")}>
          <ListItemText primary="Account" />
          {openMenus["accounts"] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenus["accounts"]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {accountMenuItems.map((subItem) => (
              <ListItemButton
                key={subItem.link}
                sx={{ pl: 4 }}
                {...(subItem.isAction ? { onClick: subItem.link === "logout" ? handleLogout : undefined } : { component: Link, to: subItem.link, selected: location.pathname === subItem.link })}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  {subItem.icon}
                  <ListItemText primary={subItem.caption} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

export default Sidebar;
