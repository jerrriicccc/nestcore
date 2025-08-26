import { Button, Form, Row, Col } from "react-bootstrap";
import { DateInput, MultiSelectInput, PhoneNumberInput, SelectInput, TextInput } from "../../components/form/Input";
import { useState } from "react";
import { useParams } from "react-router-dom";

export interface CustomerData {
  id?: number;
  firstname: string;
  lastname: string;
  statusid: number;
  // gender?: string;
  // country?: string;
  // birthdate?: string;
  // phonenumber?: string;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface CustomerFormProps {
  data: CustomerData;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
  selectOptions: {
    statuses: any;
  };
}

const fieldLabels = {
  firstname: "First Name",
  lastname: "Last Name",
  statusid: "Status",
  // country: "Country",
  // birthdate: "Birthdate",
  // phonenumber: "Phone Number",
};

const CustomerForm = ({ data = { firstname: "", lastname: "", statusid: 0 }, onChange, onSubmit, selectOptions }: CustomerFormProps) => {
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

  return (
    <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 mx-4">
      <div className="p-4">
        <Row>
          <Col md={4}>
            <TextInput name="firstname" label="First Name" data={data.firstname} onChange={onChange} error={errors.firstname} />
          </Col>
          <Col md={4}>
            <TextInput name="lastname" label="Last Name" data={data.lastname} onChange={onChange} error={errors.lastname} />
          </Col>
          <Col md={4}>
            <SelectInput name="statusid" label="Status" data={data.statusid} onChange={(e: InputType) => onChange(e)} options={selectOptions.statuses} error={errors.statusid} />
          </Col>
          {/* <Col md={6}>
            <MultiSelectInput
              name="country"
              label="Country"
              data={data}
              onChange={(e) => onChange({ ...e, inputType: "select-multi" })}
              options={[
                { value: "japan", label: "Japan" },
                { value: "philippines", label: "Philippines" },
                { value: "china", label: "China" },
                { value: "korea", label: "Korea" },
              ]}
              selectProps={{ isMulti: true }}
            />
          </Col>
          <Col md={6}>
            <DateInput name="birthdate" label="Birthdate" data={data.birthdate || ""} onChange={onChange} />
          </Col>
          <Col md={6}>
            <PhoneNumberInput name="phonenumber" label="Phone Number" data={data.phonenumber || ""} onChange={onChange} />
          </Col> */}
        </Row>

        <Row>
          <Col md={2} className="mx-auto d-flex justify-content-center">
            <Button type="submit" className="btn-success w-100">
              {mode === "create" ? "Save" : "Update"}
            </Button>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default CustomerForm;
