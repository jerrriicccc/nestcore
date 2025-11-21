import { Form } from "react-bootstrap";
import { MultiSelectInput, SelectInput } from "../../components/form/InputForm";
import RegularTable from "../../components/table/RegularTable";
import { globalRecordTable } from "./PageSettings";

// ============================================================================
// Types
// ============================================================================

interface OptionType {
  value: string | number;
  label: string;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface DataRow {
  id?: number;
  accesskey: string;
  accessvalue: string[];
  grantypeid: number;
  roleid?: string;
  typeid?: string;
  parentkey?: string;
}

interface GlobalRecordAccessFormProps {
  data: DataRow[];
  actions?: {
    onChange: (object: any) => void;
    onMenuOpen: (accesskey: string) => void;
  };
  selectOptions?: {
    [key: string]: OptionType[];
  };
}

interface SelectProps {
  isMulti: boolean;
  isClearable: boolean;
  isSearchable: boolean;
  value?: OptionType[];
  defaultValue?: OptionType[];
}

// ============================================================================
// Constants
// ============================================================================

const GRANT_TYPE_OPTIONS: OptionType[] = [
  { value: 0, label: "None" },
  { value: 1, label: "Grant" },
  { value: 2, label: "Restrict" },
];

const TABLE_PROPS = {
  hover: "hover",
  size: "sm",
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes raw options data into a consistent OptionType[] format
 */
const normalizeOptions = (raw: any): OptionType[] => {
  if (!raw) return [];

  // If already an array → ensure proper shape
  if (Array.isArray(raw)) {
    return raw.map((opt) => ({
      label: opt.label ?? String(opt.name ?? opt),
      value: opt.value ?? opt.id ?? opt,
    }));
  }

  // If object → convert to array
  if (typeof raw === "object") {
    return Object.values(raw).map((opt: any) => ({
      label: opt.label ?? String(opt.name ?? opt),
      value: opt.value ?? opt.id ?? opt,
    }));
  }

  return [];
};

/**
 * Retrieves options for a given key from selectOptions object
 * Handles various naming conventions (lowercase, plural/singular, nested data)
 */
const getOptionsForKey = (opts: any, key: string): any[] => {
  if (!opts) return [];

  const lower = key.toLowerCase();

  // Direct matches
  if (Array.isArray(opts)) return opts;
  if (opts[lower]) return opts[lower];
  if (opts[key]) return opts[key];

  // Try plural/singular variants
  if (opts[`${lower}s`]) return opts[`${lower}s`];
  if (opts[lower.replace(/s$/, "")]) return opts[lower.replace(/s$/, "")];

  // Support models.data shape: { data: { key: [...] } }
  if (opts.data && opts.data[lower]) return opts.data[lower];
  if (opts.data && opts.data[key]) return opts.data[key];

  return [];
};

/**
 * Processes options to ensure numeric values are properly typed
 */
const processOptions = (options: any[]): OptionType[] => {
  if (!Array.isArray(options)) return [];

  return options.map((option) => ({
    ...option,
    value: typeof option.value === "string" && !isNaN(Number(option.value)) ? Number(option.value) : option.value,
  }));
};

/**
 * Finds matching options from processed options based on current values
 */
const findMatchingOptions = (currentValues: any[], processedOptions: OptionType[]): OptionType[] => {
  if (!Array.isArray(currentValues)) return [];

  return currentValues
    .map((value) => {
      return processedOptions.find((opt) => String(opt.value).toLowerCase() === String(value).toLowerCase());
    })
    .filter(Boolean) as OptionType[];
};

// ============================================================================
// Component
// ============================================================================

const GlobalRecordAccessForm = ({ data, actions, selectOptions = {} }: GlobalRecordAccessFormProps) => {
  const { onMenuOpen = () => {}, onChange = () => {} } = actions || {};

  // --------------------------------------------------------------------------
  // Multi-Select Input Renderer
  // --------------------------------------------------------------------------

  const prepareValueMultiSelect = (row: DataRow, selectOptions: GlobalRecordAccessFormProps["selectOptions"], index: number) => {
    // Get and normalize options for this row's access key
    const rawOptions = getOptionsForKey(selectOptions, row.accesskey);
    const processedOptions = processOptions(rawOptions);
    const allOptions = normalizeOptions(rawOptions);

    // Find currently selected values
    const currentValues = findMatchingOptions(row.accessvalue || [], processedOptions);

    // Filter out already selected options from the available options
    const selectedValues = currentValues.map((val) => String(val.value).toLowerCase());
    const finalOptions = allOptions.filter((option) => !selectedValues.includes(String(option.value).toLowerCase()));

    // Handle value changes
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
        options={finalOptions}
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

  // --------------------------------------------------------------------------
  // Grant Type Select Renderer
  // --------------------------------------------------------------------------

  const prepareGrantSelect = (value: number, row: DataRow) => {
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

  // --------------------------------------------------------------------------
  // Data Transformation
  // --------------------------------------------------------------------------

  const arrayData = Array.isArray(data) ? data : [];
  const tableData = arrayData.map((row, index) => ({
    ...row,
    accessvalueinput: prepareValueMultiSelect(row, selectOptions, index),
    grantypeidinput: prepareGrantSelect(row.grantypeid, row),
  }));

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

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
