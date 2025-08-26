import { Button } from "react-bootstrap";
import { TextInput, NumberInput } from "../../components/form/InputForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface ServiceData {
  id?: number;
  prefix: string;
  startseries: number;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface ServiceFormProps {
  data: ServiceData;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
  handleCancelEditForm: () => void;
}

const fieldLabels = {
  prefix: "Prefix",
  startseries: "Series",
};

const AppointmentNumberForm = ({ data = { prefix: "", startseries: 0 }, onChange, onSubmit, handleCancelEditForm }: ServiceFormProps) => {
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
        <TextInput name="prefix" label="Prefix" onChange={onChange} data={data.prefix} className="form-input input-field" error={errors.prefix} />
      </td>
      <td>
        <NumberInput name="startseries" label="Series" onChange={onChange} data={data.startseries} className="form-input input-field" error={errors.startseries} />
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

export default AppointmentNumberForm;
