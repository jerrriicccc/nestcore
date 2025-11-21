import { Button } from "react-bootstrap";
import { TextInput, SelectInput } from "../../components/form/InputForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface Data {
  id?: number;
  name: string;
  type: string;
  reference: string;
  setting: number;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface FormProps {
  data: Data;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
  handleCancelEditForm: () => void;
}

const fieldLabels = {
  name: "Time Schedule",
  type: "Type",
  reference: "Reference",
  setting: "Setting",
};

const AppointmentSettingForm = ({ data = { name: "", type: "", reference: "", setting: 0 }, onChange, onSubmit, handleCancelEditForm }: FormProps) => {
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
        <TextInput name="name" label="Name" onChange={onChange} data={data.name} className="form-input input-field" error={errors.name} />
      </td>
      <td>
        <TextInput name="type" label="Type" onChange={onChange} data={data.type} className="form-input input-field" error={errors.type} />
      </td>
      <td>
        <SelectInput name="reference" label="Reference" onChange={onChange} data={data.reference} className="form-input input-field" error={errors.reference} />
      </td>
      <td>
        <SelectInput name="setting" label="Setting" onChange={onChange} data={data.setting} className="form-input input-field" error={errors.setting} />
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

export default AppointmentSettingForm;
