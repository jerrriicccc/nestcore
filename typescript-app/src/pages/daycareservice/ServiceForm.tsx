import { Button } from "react-bootstrap";
import { SelectInput, TextInput } from "../../components/form/InputForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface ServiceData {
  id?: number;
  size: string;
  threehrs: number;
  sixhrs: number;
  ninehrs: number;
  categorytypeid: number;
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
  selectOptions: {
    servicetype: any[];
  };
}

const fieldLabels = {
  size: "Size",
  threehrs: "3 hrs",
  sixhrs: "6 hrs",
  ninehrs: "9 hrs",
  categorytypeid: "Category Type",
};

const CustomerForm = ({ data = { size: "", threehrs: 0, sixhrs: 0, ninehrs: 0, categorytypeid: 0 }, onChange, onSubmit, handleCancelEditForm, selectOptions }: ServiceFormProps) => {
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

    (["threehrs", "sixhrs", "ninehrs"] as const).forEach((field) => {
      if (data[field] && isNaN(Number(data[field]))) {
        newErrors[field] = "Must be a number";
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
        <SelectInput
          name="categorytypeid"
          label="Service Type"
          data={data.categorytypeid}
          onChange={onChange}
          options={selectOptions.servicetype}
          selectProps={{ placeholder: "Service Type" }}
          error={errors.categorytypeid}
        />
      </td>
      <td>
        <TextInput name="size" label="Size" onChange={onChange} data={data.size} className="form-input input-field" error={errors.size} />
      </td>
      <td>
        <TextInput name="threehrs" label="Price for 3 hrs" onChange={onChange} data={data.threehrs} className="form-input input-field" error={errors.threehrs} />
      </td>
      <td>
        <TextInput name="sixhrs" label="Price for 6 hrs" onChange={onChange} data={data.sixhrs} className="form-input input-field" error={errors.sixhrs} />
      </td>
      <td>
        <TextInput name="ninehrs" label="Price for 9 hrs" onChange={onChange} data={data.ninehrs} className="form-input input-field" error={errors.ninehrs} />
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

export default CustomerForm;
