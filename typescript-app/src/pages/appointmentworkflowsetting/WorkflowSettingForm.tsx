import { Button } from "react-bootstrap";
import { TextInput, SelectInput, MultiSelectInput } from "../../components/form/InputForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface WorkflowSettingData {
  id?: number;
  statusid: number;
  ordernumber: string;
  linkedstatuses: string[];
  linkedfunction: string;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface WorkflowSettingFormProps {
  data: WorkflowSettingData;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
  handleCancelEditForm: () => void;
  selectOptions?: {
    appointmentstat: any;
  };
}

const fieldLabels = {
  // statusid: "Time Schedule",
  // ordernumber: "Time Schedule",
  // linkedstatuses: "Time Schedule",
  // linkedfunction: "Time Schedule",
};

const WorkflowSettingForm = ({
  data = { statusid: 0, ordernumber: "", linkedstatuses: [], linkedfunction: "" },
  onChange,
  onSubmit,
  handleCancelEditForm,
  selectOptions,
}: WorkflowSettingFormProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { mode } = useParams();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const fields = Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>;

    fields.forEach((field) => {
      if (!data[field]) {
        newErrors[field] = `${fieldLabels[field]} Required`;
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    onSubmit();
  };

  useEffect(() => {
    setErrors({});
  }, [data]);

  const handleCancel = () => {
    handleCancelEditForm();
  };

  return (
    <tr>
      <td>
        <SelectInput name="statusid" onChange={onChange} data={data.statusid} error={errors.statusid} options={selectOptions?.appointmentstat} />
      </td>
      <td>
        <TextInput name="ordernumber" label="Order Number" onChange={onChange} data={data.ordernumber} error={errors.ordernumber} />
      </td>
      <td>
        <MultiSelectInput
          name="linkedstatuses"
          onChange={(e: InputType) => onChange(e)}
          selectProps={{ isMulti: true, placeholder: "" }}
          data={data}
          error={errors.linkedstatuses}
          options={selectOptions?.appointmentstat}
        />
      </td>
      <td>
        <TextInput name="linkedfunction" label="Linked Function" onChange={onChange} data={data.linkedfunction} error={errors.linkedfunction} />
      </td>
      <td style={{ verticalAlign: "middle" }}>
        <Button variant="success" className="btn-success btn-sm" type="button" onClick={handleSubmit}>
          Save
        </Button>
        {mode === "update" && (
          <Button variant="secondary" className="btn-secondary btn-sm" style={{ marginLeft: "5px" }} type="button" onClick={handleCancel}>
            Cancel Edit
          </Button>
        )}
      </td>
    </tr>
  );
};

export default WorkflowSettingForm;
