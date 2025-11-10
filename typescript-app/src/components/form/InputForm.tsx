import React from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import "react-phone-number-input/style.css";
import "./PhoneNumberInput.css";
import { useState, useEffect } from "react";

import Select, { MultiValue, SingleValue, Props as SelectProps } from "react-select";

interface BaseInputProps {
  name: string;
  label: string;
  data: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

export const TextInput: React.FC<BaseInputProps> = ({ name, label, data, onChange, placeholder = " ", readOnly = false, error, className }) => (
  <Form.Group className="m">
    <FloatingLabel label={label}>
      <Form.Control type="text" name={name} value={data} onChange={onChange} readOnly={readOnly} placeholder={placeholder} isInvalid={!!error} className={className} />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </FloatingLabel>
  </Form.Group>
);

export const NumberInput: React.FC<BaseInputProps> = ({ name, label, data, onChange, placeholder = " ", readOnly = false, error, className }) => (
  <Form.Group className="m">
    <FloatingLabel label={label}>
      <Form.Control type="number" name={name} value={data} onChange={onChange} readOnly={readOnly} placeholder={placeholder} isInvalid={!!error} className={className} />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </FloatingLabel>
  </Form.Group>
);

//  SELECT INPUT

type OptionType = {
  label: string;
  value: string | number;
};

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

type SelectInputProps = {
  name: string;
  label: string;
  form?: string;
  data: any;
  onChange: (input: InputType) => void;
  isInvalid?: boolean;
  feedback?: string;
  selectProps?: Partial<SelectProps<OptionType>>;
  options?: OptionType[];
  disabled?: boolean;
  error?: string;
  className?: string;
};

export const SelectInput: React.FC<SelectInputProps> = ({ name, label, data, onChange, isInvalid, feedback, selectProps = {}, options = [], disabled = false, error, className }) => {
  const selectedValue = data;
  const isMulti = selectProps.isMulti;

  const defValue = isMulti ? options.filter((option) => (selectedValue || []).includes(String(option.value))) : options.find((option) => String(selectedValue) === String(option.value)) || null;

  const onChangeHandler = (selectedOption: MultiValue<OptionType> | SingleValue<OptionType> | null) => {
    if (isMulti) {
      const multiValue = (selectedOption as MultiValue<OptionType>) || [];
      onChange({
        name,
        value: multiValue.map((option) => option.value),
        inputType: "select-multi",
      });
    } else {
      const singleValue = selectedOption as SingleValue<OptionType>;
      const value = singleValue?.value || "";
      // Convert to number if the value is a numeric string
      const numericValue = typeof value === "string" && !isNaN(Number(value)) ? Number(value) : value;
      onChange({
        name,
        value: numericValue,
        inputType: "select-single",
      });
    }
  };

  return (
    <Form.Group className="" style={{ position: "relative", zIndex: 2 }}>
      <Select
        name={name}
        options={options}
        value={defValue}
        onChange={onChangeHandler}
        isDisabled={disabled}
        {...selectProps}
        classNamePrefix="select"
        menuPortalTarget={document.body}
        styles={{
          control: (provided, state) => ({
            ...provided,
            minHeight: "58px",
            borderColor: isInvalid ? "#dc3545" : state.isFocused ? "#80bdff" : provided.borderColor,
            boxShadow: isInvalid ? "0 0 0 0.2rem rgba(220, 53, 69, 0.25)" : state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : provided.boxShadow,
            "&:hover": {
              borderColor: isInvalid ? "#dc3545" : state.isFocused ? "#80bdff" : provided.borderColor,
            },
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
      {isInvalid && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {feedback}
        </Form.Control.Feedback>
      )}
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </Form.Group>
  );
};

// MULTI SELECT INPUT

interface MultiSelectInputProps {
  name: string;
  form?: string;
  label?: string;
  options: OptionType[];
  data: Record<string, any>;
  selectProps?: Partial<{
    isClearable: boolean;
    isSearchable: boolean;
    isMulti: boolean;
    placeholder: string;
  }>;

  onChange: (input: InputType) => void;
  isInvalid?: boolean;
  feedback?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  onMenuOpen?: () => void;
  placeholder?: string;
}

export const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  name,
  form = "form",
  label,
  options = [],
  data = {},
  selectProps = {},
  onChange,
  isInvalid = false,
  feedback,
  className,
  disabled = false,
  error,
  placeholder = "",

  onMenuOpen,
}) => {
  // Add hasError variable for consistent error handling
  const hasError = !!error || isInvalid;
  const selectConfig = { isClearable: true, isSearchable: true, isMulti: true, placeholder, ...selectProps };

  const selectedValues = Array.isArray(data[name]) ? data[name] : [data[name]];

  // Create a map for quick lookup of options by value
  const optionMap = new Map(options.map((option) => [String(option.value), option]));

  const defValue = selectConfig.isMulti
    ? (selectedValues.map((value: string | number) => optionMap.get(String(value))).filter((option: OptionType | undefined) => option !== undefined) as OptionType[])
    : options.find((option) => String(selectedValues) === String(option.value)) || null;

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!defValue);

  useEffect(() => {
    const isFilled = selectConfig.isMulti ? (defValue as OptionType[])?.length > 0 : !!(defValue as OptionType)?.value;
    setHasValue(isFilled || isFocused);
  }, [defValue, selectConfig.isMulti, isFocused]);

  const onChangeHandler = (selectedOption: MultiValue<OptionType> | SingleValue<OptionType> | null) => {
    const value = selectConfig.isMulti ? (selectedOption as MultiValue<OptionType>).map((option) => option.value) : (selectedOption as SingleValue<OptionType>)?.value || null;

    onChange({
      name,
      value: value === null ? "" : value,
      inputType: selectConfig.isMulti ? "select-multi" : "select-single",
    });
  };

  return (
    <Form.Group className="" style={{ position: "relative" }}>
      {label && (
        <Form.Label
          className={`form-label-floating ${hasValue ? "float" : ""}`}
          style={{
            position: "absolute",
            top: hasValue ? "-8px" : "50%",
            left: "10px",
            fontSize: hasValue ? "12px" : "16px",
            backgroundColor: "#fff",
            padding: "0 4px",
            transition: "all 0.2s ease",
            pointerEvents: "none",
            transform: hasValue ? "translateY(0)" : "translateY(-50%)",
            zIndex: 1,
          }}
        >
          {label}
        </Form.Label>
      )}
      <Select
        name={name}
        options={options}
        value={defValue}
        className={className}
        {...selectConfig}
        onChange={onChangeHandler}
        classNamePrefix="select"
        isDisabled={disabled}
        menuPortalTarget={document.body}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMenuOpen={onMenuOpen}
        styles={{
          control: (provided) => ({
            ...provided,
            minHeight: "58px",
            borderColor: hasError ? "#dc3545" : provided.borderColor,
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
      {isInvalid && <Form.Text className="text-danger">{feedback}</Form.Text>}
      {error && <Form.Text className="text-danger">{error}</Form.Text>}
    </Form.Group>
  );
};
