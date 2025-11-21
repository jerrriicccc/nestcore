import React, { Fragment } from "react";
import { Table, Button } from "react-bootstrap";
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
  formRow?: (columns: Column[]) => React.ReactNode;
}

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

const DefaultTable: React.FC<TableProps> = ({ settings, data, recordActions, tableProps = {}, actionSetting = {}, visibleColumns = {}, formRow }) => {
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
          {formRow && formRow(filteredColumns)}
          {data.length === 0 ? (
            <tr>
              <td colSpan={filteredColumns.length + (actionVisible ? 1 : 0)} className="text-center">
                No data to display
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {filteredColumns.map((column, colIndex) => (
                  <td key={column.id}>{row[column.id]}</td>
                ))}
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

export default DefaultTable;
