import React from "react";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";

interface ButtonItem {
  name: string;
  label: string;
  type: string;
  className?: string;
  path?: string | ((params: any) => string);
  items?: Array<{
    label: string;
    onsubmit: () => void;
  }>;
}

interface NavButtonsProps {
  buttons: ButtonItem[];
  params?: any;
  modalMode?: boolean;
  actions?: Record<string, (button: ButtonItem) => void>;
}

const NavButtons: React.FC<NavButtonsProps> = ({ buttons, params, modalMode, actions = {} }) => {
  const getPath = (button: ButtonItem) => {
    if (typeof button.path === "function") {
      return button.path(params);
    }
    return button.path;
  };

  return (
    <Fragment>
      {buttons.map((button, index) => (
        <Fragment key={button.name}>
          {(button.type === "link" || button.type === "dynamicLink") && (
            <div>
              {modalMode !== true && (
                <Link className={`btn me-1 ${button.className ? button.className : "btn-secondary"}`} to={getPath(button) || ""}>
                  {button.label}
                </Link>
              )}
            </div>
          )}
          {button.type === "dropdown" && (
            <Dropdown className="d-inline-block me-2">
              <Dropdown.Toggle variant="secondary" size="lg">
                {button.label}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {button.items && button.items.length > 0 ? (
                  button.items.map((item, index) => (
                    <Dropdown.Item key={index} onClick={(event) => item.onsubmit()}>
                      {item.label}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item>No items</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}
          {button.type === "btnExport" && (
            <Dropdown className="d-inline-block me-2">
              <Dropdown.Toggle variant="secondary" size="lg">
                {button.label}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {button.items && button.items.length > 0 ? (
                  button.items.map((item, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={(event) => {
                        event.preventDefault();
                        item.onsubmit();
                      }}
                    >
                      {item.label}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item>No items</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Fragment>
      ))}
    </Fragment>
  );
};

export default NavButtons;
