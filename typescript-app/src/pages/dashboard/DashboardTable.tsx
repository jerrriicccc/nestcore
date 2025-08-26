import RegularTable from "../../components/table/RegularTable";
import { listTable } from "./PageSettings";

interface CustomerTableProps {
  data: any[];
  actions: {
    dropdownBtn: (id: number) => void;
  };
}

const CustomerTable = ({ data, actions }: CustomerTableProps) => {
  const tableProps = { striped: true, hover: "hover", className: "table-th", size: "sm" };

  const recordActions = {
    dropdownBtn: (event: React.MouseEvent, row: any) => actions.dropdownBtn(row.id),
  };

  return <RegularTable settings={listTable} data={data} recordActions={recordActions} tableProps={tableProps} />;
};

export default CustomerTable;
