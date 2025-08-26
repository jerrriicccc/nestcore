import RegularTable from "../../components/table/RegularTable";
import { listTable } from "./PageSettings";

interface RoleAccessTableProps {
  data: any[];
  actions: {
    delete: (id: number) => void;
    update: (id: number) => void;
  };
}

const RoleAccessTable = ({ data, actions }: RoleAccessTableProps) => {
  const tableProps = { hover: "hover", size: "sm" };

  const recordActions = {
    delete: (event: React.MouseEvent, row: any) => actions.delete(row.id),
    update: (event: React.MouseEvent, row: any) => actions.update(row.id),
  };

  return <RegularTable settings={listTable} data={data} recordActions={recordActions} tableProps={tableProps} />;
};

export default RoleAccessTable;
