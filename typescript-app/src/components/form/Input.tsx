import React, { useState, useEffect } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import Select, { MultiValue, SingleValue, Props as SelectProps } from "react-select";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "./PhoneNumberInput.css";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Card } from "react-bootstrap";

interface BaseInputProps {
  name: string;
  label: string;
  data: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: string;
  className?: string;
}

export const TextInput: React.FC<BaseInputProps> = ({ name, label, data, onChange, placeholder = " ", readOnly = false, error, className }) => (
  <Form.Group className="mb-3">
    <FloatingLabel label={label}>
      <Form.Control type="text" name={name} value={data} onChange={onChange} readOnly={readOnly} placeholder={placeholder} isInvalid={!!error} className={className} />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </FloatingLabel>
  </Form.Group>
);

export const PasswordInput: React.FC<BaseInputProps> = ({ name, label, data, onChange, placeholder = " ", readOnly = false, error, className }) => (
  <Form.Group className="mb-3">
    <FloatingLabel label={label}>
      <Form.Control type="password" name={name} value={data} onChange={onChange} readOnly={readOnly} placeholder={placeholder} isInvalid={!!error} className={className} />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </FloatingLabel>
  </Form.Group>
);

export const DateInput: React.FC<BaseInputProps> = ({ name, label, data, onChange, readOnly = false, error, className }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        className="mb-3"
        label={label}
        value={data ? dayjs(data) : null}
        onChange={(newValue) => {
          if (newValue) {
            const fakeEvent = {
              target: {
                name,
                value: newValue.format("YYYY-MM-DD"),
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(fakeEvent);
          }
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            name,
            error: !!error,
            helperText: error || "",
          },
        }}
      />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
    </LocalizationProvider>
  );
};

export const PhoneNumberInput: React.FC<BaseInputProps> = ({ name, data, onChange, readOnly = false, error, className }) => {
  return (
    <Form.Group className="mb-3">
      <PhoneInput
        international
        defaultCountry="PH"
        value={data}
        onChange={(phoneValue: string | undefined) => {
          const fakeEvent = {
            target: {
              name,
              value: phoneValue || "",
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(fakeEvent);
        }}
        className="custom-phone-input"
      />
      {error && <div className="text-danger mt-1">{error}</div>}
    </Form.Group>
  );
};

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
  placeholder?: string;
};

export const SelectInput: React.FC<SelectInputProps> = ({ name, label, data, onChange, isInvalid = false, feedback, selectProps = {}, options = [], disabled = false, error, placeholder = "" }) => {
  const isMulti = selectProps.isMulti;

  // The issue is here - isInvalid should be true when there's an error
  const hasError = !!error || isInvalid;

  const defValue = isMulti ? options.filter((option) => (data || []).includes(String(option.value))) : options.find((option) => String(data) === String(option.value)) || null;

  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!defValue);

  useEffect(() => {
    const isFilled = isMulti ? (defValue as OptionType[])?.length > 0 : !!(defValue as OptionType)?.value;
    setHasValue(isFilled || isFocused);
  }, [defValue, isMulti, isFocused]);

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
      const numericValue = typeof value === "string" && !isNaN(Number(value)) ? Number(value) : value;
      onChange({
        name,
        value: numericValue,
        inputType: "select-single",
      });
    }
  };

  return (
    <Form.Group className={`mb-3 ${hasError ? "has-error" : ""}`} style={{ position: "relative", zIndex: 2 }}>
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
        onChange={onChangeHandler}
        isDisabled={disabled}
        {...selectProps}
        classNamePrefix="select"
        menuPortalTarget={document.body}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        styles={{
          control: (provided, state) => ({
            ...provided,
            minHeight: "58px",
            borderColor: hasError ? "#dc3545" : state.isFocused ? "#80bdff" : provided.borderColor,
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
    <Form.Group className={`mb-3 ${hasError ? "has-error" : ""}`} style={{ position: "relative" }}>
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

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface BookingCalendarProps {
  bookedDates?: string[];
  onSelectDate: (date: string) => void;
  availableTimeSlots?: any[];
  selectedTimeId?: number | null; // allow null
  onSelectTime?: (timeId: number | null) => void; // allow null
}

export const BookingCalendar = ({ bookedDates = [], onSelectDate, availableTimeSlots = [], selectedTimeId, onSelectTime }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      // Fix: Use a consistent date format not affected by time zone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Disable Sundays (day 0) and already booked dates
      return dayOfWeek === 0 || bookedDates.includes(dateStr);
    }
    return false;
  };

  // Fix the onChange handler to properly handle the Value type
  const handleDateChange = (value: Value) => {
    // Handle the case where value could be a Date, null, or a date range
    let date: Date | null = null;

    if (value instanceof Date) {
      date = value;
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      // Handle date range (take the first date)
      date = value[0];
    }

    setSelectedDate(date);

    if (date) {
      // Corrected line: Format the date string manually to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      onSelectDate(dateStr);
    }
  };

  const handleTimeSelect = (timeId: number) => {
    // toggle: if clicking the selected one, unselect (null), else select
    onSelectTime?.(selectedTimeId != null && Number(selectedTimeId) === Number(timeId) ? null : Number(timeId));
  };

  return (
    <Card className="d-flex flex-row shadow-sm mb-3">
      {/* Calendar on the left */}
      <div className="p-3 border-end">
        <Calendar onChange={handleDateChange} value={selectedDate} tileDisabled={tileDisabled} />
      </div>

      {/* Booking info on the right */}
      <div className="p-3 flex-grow-1">
        {selectedDate ? (
          <div>
            <h6 className="mb-3">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h6>

            {availableTimeSlots.length > 0 ? (
              <div>
                <p className="text-success mb-2">
                  <i className="fas fa-clock me-2"></i>
                  Available Time Slots:
                </p>

                <div className="row g-2">
                  {availableTimeSlots.map((timeSlot) => {
                    const isSelected = selectedTimeId != null && Number(selectedTimeId) === Number(timeSlot.value);
                    return (
                      <div key={timeSlot.value} className="col-3">
                        <button
                          type="button"
                          className={`btn btn-sm w-100 ${isSelected ? "btn-primary text-white fw-bold" : "btn-outline-primary"}`}
                          onClick={(e) => {
                            handleTimeSelect(Number(timeSlot.value));
                            (e.currentTarget as HTMLButtonElement).blur(); // clear focus to avoid sticky styles
                          }}
                          style={{
                            border: isSelected ? "2px solid #0d6efd" : "1px solid #0d6efd",
                            cursor: "pointer",
                          }}
                        >
                          {timeSlot.label}
                          {isSelected && <i className="fas fa-check ms-1"></i>}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedTimeId != null && (
                  <div className="mt-3 p-2 bg-primary bg-opacity-10 rounded">
                    <small className="text-primary fw-bold">
                      <i className="fas fa-check-circle me-1"></i>
                      Time slot selected: {availableTimeSlots.find((t) => Number(t.value) === Number(selectedTimeId))?.label}
                    </small>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <i className="fas fa-calendar-times text-muted mb-2" style={{ fontSize: "2rem" }}></i>
                <h4 className="text-muted mb-0">No available slots</h4>
                <h6 className="text-muted">Fully Booked</h6>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-3">
            <i className="fas fa-calendar-alt text-muted mb-2" style={{ fontSize: "2rem" }}></i>
            <h4 className="text-muted mb-0">Select a date to view available slots</h4>
          </div>
        )}
      </div>
    </Card>
  );
};
