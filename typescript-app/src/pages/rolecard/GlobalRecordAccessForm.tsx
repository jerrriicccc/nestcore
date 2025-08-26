import { Form } from "react-bootstrap";
import { MultiSelectInput, SelectInput } from "../../components/form/Input";
import RegularTable from "../../components/table/RegularTable";
import { globalRecordTable } from "./PageSettings";

// Types
interface OptionType {
  value: string | number;
  label: string;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface GlobalRecordAccessFormProps {
  data: {
    id?: number;
    accesskey: string;
    accessvalue: string[];
    grantypeid: number;
    roleid?: string;
    typeid?: string;
    parentkey?: string;
  }[];
  actions?: {
    onChange: (object: any) => void;
    onMenuOpen: (accesskey: string) => void;
  };
  selectOptions?: {
    [key: string]: OptionType[];
  };
}

// Constants
const GRANT_TYPE_OPTIONS: OptionType[] = [
  { value: 0, label: "None" },
  { value: 1, label: "Grant" },
  { value: 2, label: "Restrict" },
];

const TABLE_PROPS = { hover: "hover", size: "sm" } as const;

interface SelectProps {
  isMulti: boolean;
  isClearable: boolean;
  isSearchable: boolean;
  value?: OptionType[];
  defaultValue?: OptionType[];
}

const GlobalRecordAccessForm = ({ data, actions, selectOptions = {} }: GlobalRecordAccessFormProps) => {
  const { onMenuOpen = () => {}, onChange = () => {} } = actions || {};

  // Helper Functions
  const prepareValueMultiSelect = (row: GlobalRecordAccessFormProps["data"][0], selectOptions: GlobalRecordAccessFormProps["selectOptions"], index: number) => {
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

  const prepareGrantSelect = (value: number, row: any) => {
    const handleGrantTypeChange = (value: any) => {
      const selectedValue = value?.value !== undefined ? value.value : value;
      const grantTypeValue = typeof selectedValue === "number" ? selectedValue : 0;

      onChange({
        type: "updatefield",
        id: row.id,
        field: "grantypeid",
        value: grantTypeValue,
      });
    };

    return <SelectInput name="grantypeid" label="" data={value || 0} options={GRANT_TYPE_OPTIONS} onChange={handleGrantTypeChange} />;
  };

  // Data Transformation
  const arrayData = Array.isArray(data) ? data : [];

  const tableData = arrayData.map((row, index) => ({
    ...row,
    accessvalueinput: prepareValueMultiSelect(row, selectOptions, index),
    grantypeidinput: prepareGrantSelect(row.grantypeid, row),
  }));

  return (
    <Form className="card shadow-sm mb-2 p-4 me-4">
      <div className="p-3">
        <h4>Global Record Access Form</h4>
      </div>
      <RegularTable data={tableData} recordActions={{}} settings={globalRecordTable} tableProps={TABLE_PROPS} actionSetting={{ visible: false }} />
    </Form>
  );
};

export default GlobalRecordAccessForm;
