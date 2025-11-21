import FormTable from "../../components/table/FormTable";
import AppointmentStatusForm from "./AppointmentStatusForm"; // Import the form
import { listTable } from "./PageSettings";

interface AppointmentStatusTableProps {
  data: any[];
  actions: {
    delete: (id: number) => void;
    update: (id: number) => void;
  };
  formData?: any;
  onChange?: (e: any) => void;
  onSubmit?: () => void;
  handleCancelEditForm?: () => void; // Added prop
}

const AppointmentStatusTable = ({ data, actions, formData, onChange, onSubmit, handleCancelEditForm }: AppointmentStatusTableProps) => {
  const tableProps = { striped: true, hover: "hover", className: "table-th", size: "sm" };

  const recordActions = {
    delete: (event: React.MouseEvent, row: any) => actions.delete(row.id),
    update: (event: React.MouseEvent, row: any) => actions.update(row.id),
  };

  return (
    <FormTable
      settings={{ ...listTable }}
      data={data}
      recordActions={recordActions}
      tableProps={tableProps}
      formRow={
        formData && onChange && onSubmit && handleCancelEditForm
          ? () => <AppointmentStatusForm data={formData} onChange={onChange} onSubmit={onSubmit} handleCancelEditForm={handleCancelEditForm} />
          : undefined
      }
    />
  );
};

export default AppointmentStatusTable;
