import React from "react";
import { Card } from "react-bootstrap";
import { MultiSelectInput } from "../../components/form/InputForm";
import RegularTable from "../../components/table/RegularTable";
import { moduleTable } from "./PageSettings";

// ============================================================================
// Types
// ============================================================================

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

interface DataRow {
  id?: number;
  accesskey: string;
  accessvalue?: string[];
  availableOptions?: string[];
}

interface ModuleAccessFormProps {
  data?: DataRow[];
  actions?: {
    onChange: (object: any) => void;
    onMenuOpen: (accesskey: string) => void;
  };
  selectOptions?: {
    [key: string]: OptionType[];
  };
}

// ============================================================================
// Constants
// ============================================================================

const TABLE_PROPS = {
  striped: "striped",
  hover: "hover",
  className: "table-th",
  size: "sm",
  responsive: true,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
//  * Retrieves options for a given access key from selectOptions
//  * Uses case-insensitive key matching
//  */
const getOptionsForAccessKey = (selectOptions: ModuleAccessFormProps["selectOptions"], accessKey: string): OptionType[] => {
  if (!selectOptions || typeof selectOptions !== "object") {
    return [];
  }

  const lowerKey = accessKey.toLowerCase();
  return selectOptions[lowerKey] || [];
};

/**
 * Processes raw options to ensure consistent structure
 * Maintains original value and label properties
 */
const processOptions = (options: any[]): OptionType[] => {
  if (!Array.isArray(options)) return [];

  return options.map((option) => ({
    value: option.value,
    label: option.label,
  }));
};

/**
 * Finds matching options from processed options based on access values
 * Uses case-insensitive matching for values
 */
const findMatchingValues = (accessValues: string[] | undefined, processedOptions: OptionType[]): OptionType[] => {
  if (!Array.isArray(accessValues)) return [];

  return accessValues
    .map((value) => {
      return processedOptions.find((opt) => String(opt.value).toLowerCase() === String(value).toLowerCase());
    })
    .filter(Boolean) as OptionType[];
};

// ============================================================================
// Component
// ============================================================================

const ModuleAccessForm = ({ data = [], selectOptions, actions, ...restProps }: ModuleAccessFormProps) => {
  const { onMenuOpen = () => {}, onChange = () => {} } = actions || {};

  // --------------------------------------------------------------------------
  // Multi-Select Input Renderer
  // --------------------------------------------------------------------------

  const prepareValueMultiSelect = (row: DataRow, selectOptions: ModuleAccessFormProps["selectOptions"], index: number) => {
    // Get and process options for this access key
    const rawOptions = getOptionsForAccessKey(selectOptions, row.accesskey);
    const processedOptions = processOptions(rawOptions);

    // Find currently selected values
    const currentValues = findMatchingValues(row.accessvalue, processedOptions);

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
        onMenuOpen={() => {}}
      />
    );
  };

  // --------------------------------------------------------------------------
  // Data Transformation
  // --------------------------------------------------------------------------

  const tableData = data.map((row, index) => ({
    ...row,
    accessvalueinput: prepareValueMultiSelect(row, selectOptions, index),
  }));

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <Card className="card shadow-sm p-4 mx-4">
      <div className="p-3">
        <h4>Module Access</h4>
      </div>
      <RegularTable settings={moduleTable} data={tableData} tableProps={TABLE_PROPS} recordActions={{}} />
    </Card>
  );
};

export default ModuleAccessForm;
