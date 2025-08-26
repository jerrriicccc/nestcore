import React from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import "react-phone-number-input/style.css";
import "./PhoneNumberInput.css";

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
