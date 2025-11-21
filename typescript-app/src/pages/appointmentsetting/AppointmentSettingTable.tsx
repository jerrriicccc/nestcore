import FormTable from "../../components/table/FormTable";
import AppointmentSettingForm from "./AppointmentSettingForm";
import { listTable } from "./PageSettings";

interface ServiceTableProps {
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

const AppointmentSettingTable = ({ data, actions, formData, onChange, onSubmit, handleCancelEditForm }: ServiceTableProps) => {
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
          ? () => <AppointmentSettingForm data={formData} onChange={onChange} onSubmit={onSubmit} handleCancelEditForm={handleCancelEditForm} />
          : undefined
      }
    />
  );
};

export default AppointmentSettingTable;
