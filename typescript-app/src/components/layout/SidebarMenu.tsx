import React from "react";
import { Button, Collapse, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

// Define types for menu items
interface MenuItem {
  link: string;
  caption: string;
}

interface SidebarMenuProps {
  menuName: string;
  menuHandler: () => void;
  variable: { [key: string]: boolean };
  menuItems: MenuItem[];
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ menuName, menuHandler, variable, menuItems }) => {
  return (
    <li className="sidebar-dropdown">
      <Button onClick={menuHandler} className="list-group-item list-group-item-action rounded-0">
        {menuName} <span className="arrow-down"></span>
      </Button>
      <Collapse in={variable[menuName.toLowerCase()]}>
        <ListGroup variant="flush">
          {menuItems.map((menuItem, index) => (
            <Link key={`${menuName}${index}`} to={menuItem.link} className="list-group-item list-group-item-action ms-2">
              {menuItem.caption}
            </Link>
          ))}
        </ListGroup>
      </Collapse>
    </li>
  );
};

export default SidebarMenu;
