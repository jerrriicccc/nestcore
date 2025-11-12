import RegularTable from "../../components/table/RegularTable";
import { listTable } from "./PageSettings";

interface UserTableProps {
  data: any[];
  actions: {
    delete: (id: number) => void;
    update: (id: number) => void;
  };
  visibleColumns: { [key: string]: boolean };
  columnOrder: string[];
}

const AppointmentTable = ({ data, actions, visibleColumns, columnOrder }: UserTableProps) => {
  const tableProps = { hover: "hover", size: "sm" };

  const recordActions = {
    delete: (event: React.MouseEvent, row: any) => actions.delete(row.id),
    update: (event: React.MouseEvent, row: any) => actions.update(row.id),
  };

  // Create a map of column IDs to their full column objects
  const columnMap = new Map(listTable.columns.map((column) => [column.id, column]));

  // Filter and order columns based on visibility and order
  const filteredColumns = columnOrder
    .filter((columnId) => visibleColumns[columnId])
    .map((columnId) => columnMap.get(columnId))
    .filter((column): column is (typeof listTable.columns)[0] => column !== undefined);

  const filteredTableSettings = {
    ...listTable,
    columns: filteredColumns,
  };

  return <RegularTable settings={filteredTableSettings} data={data} recordActions={recordActions} tableProps={tableProps} visibleColumns={visibleColumns} />;
};

export default AppointmentTable;
