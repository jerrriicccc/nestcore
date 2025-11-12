import React, { useState } from "react";
import { Drawer, List, ListItemButton, ListItemText, Collapse, Box } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import PeopleIcon from "@mui/icons-material/People";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export interface SidebarItem {
  link: string;
  caption: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

export const DashboardItems: SidebarItem[] = [{ link: "/dashboard", caption: "Dashboard", icon: <DashboardIcon /> }];
export const bookingMenuItems: SidebarItem[] = [
  { link: "/appointmentlist", caption: "List", icon: <FormatListBulletedIcon /> },
  { link: "/appointmentsettings/create", caption: "Settings", icon: <FormatListBulletedIcon /> },
];
export const servicesMenuItems: SidebarItem[] = [{ link: "/servicesettinghome", caption: "Home", icon: <FormatListBulletedIcon /> }];
export const workflowMenuItems: SidebarItem[] = [
  { link: "/workflowsettings/create", caption: "List", icon: <FormatListBulletedIcon /> },
  { link: "/statuses/create", caption: "Status", icon: <FormatListBulletedIcon /> },
];

export const userMenuItems: SidebarItem[] = [
  { link: "/userlist", caption: "Users", icon: <PeopleIcon /> },
  { link: "/rolelist", caption: "Roles", icon: <ManageAccountsIcon /> },
];

const drawerWidth = 240; // Sidebar width
const appBarHeight = 56; // AppBar height

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();

  const handleToggle = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const renderMenuItem = (item: SidebarItem) => (
    <ListItemButton key={item.link} component={Link} to={item.link} selected={location.pathname === item.link}>
      <Box display="flex" alignItems="center" gap={1}>
        {item.icon}
        <ListItemText primary={item.caption} />
      </Box>
    </ListItemButton>
  );

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

        {/* Services  */}
        <ListItemButton onClick={() => handleToggle("services")}>
          <ListItemText primary="Services" />
          {openMenus["services"] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenus["services"]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {servicesMenuItems.map((subItem) => (
              <ListItemButton key={subItem.link} sx={{ pl: 4 }} component={Link} to={subItem.link} selected={location.pathname === subItem.link}>
                <Box display="flex" alignItems="center" gap={1}>
                  {subItem.icon}
                  <ListItemText primary={subItem.caption} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Workflow Settings  */}
        <ListItemButton onClick={() => handleToggle("workflowsettings")}>
          <ListItemText primary="Workflow" />
          {openMenus["workflowsettings"] ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMenus["workflowsettings"]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {workflowMenuItems.map((subItem) => (
              <ListItemButton key={subItem.link} sx={{ pl: 4 }} component={Link} to={subItem.link} selected={location.pathname === subItem.link}>
                <Box display="flex" alignItems="center" gap={1}>
                  {subItem.icon}
                  <ListItemText primary={subItem.caption} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Collapse>

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
      </List>
    </Drawer>
  );
};

export default Sidebar;
