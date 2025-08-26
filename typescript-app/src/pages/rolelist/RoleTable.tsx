import RegularTable from "../../components/table/RegularTable";
import { listTable } from "./PageSettings";

interface RoleTableProps {
  data: any[];
  actions: {
    delete: (id: number) => void;
    update: (id: number) => void;
  };
}

const RoleTable = ({ data, actions }: RoleTableProps) => {
  const tableProps = { hover: "hover", size: "sm" };

  const recordActions = {
    delete: (event: React.MouseEvent, row: any) => actions.delete(row.id),
    update: (event: React.MouseEvent, row: any) => actions.update(row.id),
  };

  return <RegularTable settings={listTable} data={data} recordActions={recordActions} tableProps={tableProps} />;
};

export default RoleTable;
