import React from "react";
import { Card } from "react-bootstrap";
import { moduleTable } from "./PageSettings";
import RegularTable from "../../components/table/RegularTable";
import { MultiSelectInput } from "../../components/form/Input";

interface OptionType {
  value: string | number;
  label: string;
}

interface SelectProps {
  isMulti: boolean;
  isClearable: boolean;
  isSearchable: boolean;
  value?: OptionType[];
  defaultValue?: OptionType[];
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface ModuleAccessFormProps {
  data: {
    id?: number;
    accesskey: string;
    accessvalue: string[];
  }[];
  actions?: {
    onChange: (object: any) => void;
    onMenuOpen: (accesskey: string) => void;
  };
  selectOptions?: {
    [key: string]: OptionType[];
  };
}

const ModuleAccessForm = ({ data = [], selectOptions, actions, ...restProps }: ModuleAccessFormProps) => {
  const tableProps = {
    striped: "striped",
    hover: "hover",
    className: "table-th",
    size: "sm",
    responsive: true,
  };
  const { onMenuOpen = () => {}, onChange = () => {} } = actions || {};

  // Helper Functions
  const prepareValueMultiSelect = (row: ModuleAccessFormProps["data"][0], selectOptions: ModuleAccessFormProps["selectOptions"], index: number) => {
    const options = selectOptions && typeof selectOptions === "object" && row.accesskey.toLowerCase() in selectOptions ? selectOptions[row.accesskey.toLowerCase()] : [];
    const processedOptions = Array.isArray(options)
      ? options.map((option) => ({
          ...option,
          value: typeof option.value === "string" && !isNaN(Number(option.value)) ? Number(option.value) : option.value,
        }))
      : [];

    const currentValues = Array.isArray(row.accessvalue)
      ? row.accessvalue.map((value) => {
          const matchingOption = processedOptions.find((opt) => String(opt.value).toLowerCase() === String(value).toLowerCase());
          if (matchingOption) {
            return matchingOption;
          }
        })
      : [];

    const handleChange = (e: InputType) => {
      onChange({
        type: "updatefield",
        id: row.id,
        field: "accessvalue",
        value: e.value,
      });
    };

    return (
      <MultiSelectInput
        name="accessvalue"
        data={{ accessvalue: currentValues }}
        onChange={handleChange}
        options={processedOptions}
        selectProps={
          {
            isMulti: true,
            isClearable: true,
            isSearchable: true,
            value: currentValues,
            defaultValue: currentValues,
          } as SelectProps
        }
        onMenuOpen={() => onMenuOpen(row.accesskey)}
      />
    );
  };

  const tableData = data.map((row, index) => ({
    ...row,
    accessvalueinput: prepareValueMultiSelect(row, selectOptions, index),
  }));

  return (
    <Card className="card shadow-sm p-4 mx-4">
      <div className="p-3">
        <h4>Module Access</h4>
      </div>
      <RegularTable settings={moduleTable} data={tableData} tableProps={tableProps} recordActions={{}} />
    </Card>
  );
};

export default ModuleAccessForm;
