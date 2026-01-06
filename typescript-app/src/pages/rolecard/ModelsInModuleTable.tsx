import RegularTable from "../../components/table/RegularTable";
import { globalRecordTable } from "./PageSettings";
import { MultiSelectInput, SelectInput } from "../../components/form/InputForm";
import React from "react";

type OptionType = { value: string | number; label: string };

interface ModelsInModuleTableProps {
  data?: any[];
  selectOptions?: Record<string, OptionType[]>;
  actions?: {
    onChange?: (object: any) => void;
    onMenuOpen?: (accesskey: string) => void;
  };
}

const ModelsInModuleTable: React.FC<ModelsInModuleTableProps> = (props) => {
  const tableProps = { striped: "striped", hover: "hover", className: "table-th", size: "sm" };
  const { actions = {} } = props;
  const { onMenuOpen = () => {} } = actions as NonNullable<ModelsInModuleTableProps["actions"]>;
  const { data = [] } = props;

  const prepareValueMultiSelect = (row: any, index: number) => {
    const options: OptionType[] = row.accesskey in (props.selectOptions || {}) ? (props.selectOptions || {})[row.accesskey] : [];
    return (
      <MultiSelectInput
        name="accessvalue"
        data={row}
        options={options}
        onMenuOpen={() => {
          onMenuOpen(row.accesskey);
        }}
        onChange={(object) => {
          props.actions?.onChange?.({ ...object, id: row.id, index });
        }}
      />
    );
  };

  const grantTypeOptions = [
    { value: 0, label: "None" },
    { value: 1, label: "Grant" },
    { value: 2, label: "Restrict" },
  ];

  const prepareGrantSelect = (row: any, index: number) => {
    return (
      <SelectInput
        name="granttypeid"
        data={row}
        options={grantTypeOptions}
        onChange={(object) => {
          props.actions?.onChange?.({ ...object, id: row.id, index });
        }}
      />
    );
  };

  const newData = (data || []).map((row: any, index: number) => {
    return { ...row, accessvalueinput: prepareValueMultiSelect(row, index), granttypeidinput: prepareGrantSelect(row, index) };
  });

  return <RegularTable settings={globalRecordTable} {...props} data={newData} tableProps={tableProps} actionSetting={{ visible: false }} recordActions={{}} />;
};

export default ModelsInModuleTable;
