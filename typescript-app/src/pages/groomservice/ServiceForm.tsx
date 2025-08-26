import { Button } from "react-bootstrap";
import { TextInput, SelectInput } from "../../components/form/InputForm";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export interface ServiceData {
  id?: number;
  size: string;
  weight: string;
  type: string;
  price: string;
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
  selectOptions: {
    servicetype: { label: string; value: string | number }[];
  };
  handleCancelEditForm: () => void;
}

const fieldLabels = {
  size: "Size",
  type: "Type",
  price: "Price",
  categorytypeid: "Category Type",
};

const CustomerForm = ({ data = { size: "", weight: "", type: "", price: "", categorytypeid: 0 }, onChange, onSubmit, selectOptions, handleCancelEditForm }: ServiceFormProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { mode } = useParams();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const fields = Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>;

    fields.forEach((field) => {
      if (!data[field as keyof ServiceData]) {
        newErrors[field] = `${fieldLabels[field]} Required`;
      }
    });

    if (data.price && isNaN(Number(data.price))) {
      newErrors.price = "Price must be a number";
    }

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
          label=""
          data={data.categorytypeid}
          onChange={onChange}
          options={selectOptions.servicetype}
          selectProps={{ placeholder: "Category Type" }}
          error={errors.categorytypeid}
        />
      </td>
      <td>
        <TextInput name="size" label="Size" onChange={onChange} data={data.size} className="form-input input-field" error={errors.size} />
      </td>
      <td>
        <TextInput name="weight" label="Weight" onChange={onChange} data={data.weight} className="form-input input-field" />
      </td>
      <td>
        <TextInput name="type" label="Type" onChange={onChange} data={data.type} className="form-input input-field" error={errors.type} />
      </td>
      <td>
        <TextInput name="price" label="Price" onChange={onChange} data={data.price} className="form-input input-field" error={errors.price} />
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
