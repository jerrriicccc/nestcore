import React, { Fragment } from "react";
import { Table, Button, Dropdown } from "react-bootstrap";
import { Link, createSearchParams } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";

export interface Column {
  id: string;
  label?: string;
  hidden?: boolean;
  align?: "left" | "center" | "right";
}

export interface ButtonAction {
  name: string;
  type: "link" | "dynamicLink" | "button";
  label: string;
  variant?: string;
  url?: {
    path: string;
    ref: string;
  };
}

interface TableProps {
  settings: {
    columns: Column[] | any[];
    buttons: ButtonAction[] | any[];
  };
  data: Record<string, any>[];
  recordActions: Record<string, (event: React.MouseEvent, row: Record<string, any>, index: number) => void>;
  tableProps?: object;
  actionSetting?: { style?: React.CSSProperties; visible?: boolean };
  visibleColumns?: { [key: string]: boolean };
}

const getStatusBackgroundColor = (statusname: string): { backgroundColor: string; color: string } => {
  const statusMap: Record<string, { backgroundColor: string; color: string }> = {
    verified: { backgroundColor: "#d1edcc", color: "#155724" },
    pending: { backgroundColor: "#fff3cd", color: "#856404" },
    locked: { backgroundColor: "#f8d7da", color: "#721c24" },
  };
  return statusMap[statusname?.toLowerCase()] || { backgroundColor: "#e2e3e5", color: "#383d41" };
};

export const generateURL = (row: Record<string, any>, url: { path: string; ref: string } | ((row: Record<string, any>) => any), type: string) => {
  if (type === "link") {
    return {
      pathname: (url as { path: string; ref: string }).path,
      search: `${createSearchParams({
        [(url as { path: string; ref: string }).ref]: row[(url as { path: string; ref: string }).ref],
      })}`,
    };
  } else if (type === "dynamicLink" && typeof url === "function") {
    return url(row);
  }
  return {};
};

const RegularTable: React.FC<TableProps> = ({ settings, data, recordActions, tableProps = {}, actionSetting = {}, visibleColumns = {} }) => {
  const { style: actionStyle = {}, visible: actionVisible = true } = actionSetting;

  const visibleColumnIds = Object.entries(visibleColumns)
    .filter(([_, isVisible]) => isVisible)
    .map(([id]) => id);

  const filteredColumns = settings.columns.filter((column) => (visibleColumnIds.length ? visibleColumnIds.includes(column.id) : !column.hidden));

  return (
    <div className="card rounded-0 p-2 shadow-sm table table-responsive" style={{ backgroundColor: "white" }}>
      <Table {...tableProps}>
        <thead>
          <tr>
            {filteredColumns.map(({ id, hidden = false, label, align = "left" }) => (
              <Fragment key={id}>{!hidden && <th style={{ textAlign: align }}>{label}</th>}</Fragment>
            ))}
            {actionVisible && <th style={actionStyle}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={filteredColumns.length + (actionVisible ? 1 : 0)} className="text-center">
                No data to display
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {filteredColumns.map(({ id, hidden = false, align = "left" }) =>
                  !hidden ? (
                    <td key={id} style={{ textAlign: align, verticalAlign: "middle" }}>
                      {id === "statusname" ? (
                        <div
                          style={{
                            ...getStatusBackgroundColor(row.statusname),
                            borderRadius: "20px",
                            padding: "6px 12px",
                            fontSize: "16px",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: getStatusBackgroundColor(row.statusname).color,
                            }}
                          ></span>
                          {row[id]}
                        </div>
                      ) : (
                        row[id]
                      )}
                    </td>
                  ) : null
                )}
                {actionVisible && (
                  <td style={{ verticalAlign: "middle" }}>
                    {settings.buttons.map((button, bIndex) => (
                      <Fragment key={bIndex}>
                        {button.type === "link" && button.url && (
                          <Link
                            className="btn btn-sm me-2"
                            style={{
                              backgroundColor: "#014c77",
                              borderColor: "#014c77",
                              color: "white",
                            }}
                            to={generateURL(row, button.url, button.type)}
                          >
                            {button.name === "update" && <EditNoteIcon fontSize="small" className="me-1" />}
                            {button.label}
                          </Link>
                        )}
                        {button.type === "button" && (
                          <Button variant={button.variant || "danger"} size="sm" className="me-2" onClick={(event) => recordActions[button.name](event, row, rowIndex)}>
                            {button.name === "delete" && <DeleteOutlineIcon fontSize="small" className="me-1" />}
                            {button.label}
                          </Button>
                        )}
                        {button.type === "dropdownBtn" && (
                          <Dropdown className="d-inline-block me-2">
                            <Dropdown.Toggle variant="primary" size="sm">
                              {button.label}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              {/* {button.items && button.items.length > 0 ? (
                                button.items.map((item, index) => (
                                  <Dropdown.Item key={index} onClick={(event) => item.onsubmit(event, row, item.id)}>
                                    {item.label}
                                  </Dropdown.Item>
                                ))
                              ) : (
                                <Dropdown.Item disabled>No options available</Dropdown.Item>
                              )} */}
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </Fragment>
                    ))}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default RegularTable;
