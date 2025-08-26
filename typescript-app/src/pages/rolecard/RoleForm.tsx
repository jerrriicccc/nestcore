import { Button, Form, Row, Col } from "react-bootstrap";
import { TextInput } from "../../components/form/Input";
import { useState } from "react";
import { useParams } from "react-router-dom";

export interface RoleData {
  id?: number;
  name: string;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface RoleFormProps {
  data: RoleData;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
}

const fieldLabels = {
  name: "Name",
};

const RoleForm = ({ data = { name: "" }, onChange, onSubmit }: RoleFormProps) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      name,
      value,
      inputType: "select-single",
    });
  };

  return (
    <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 p-2 ms-4">
      <div className="p-3">
        <h4>Role</h4>
        <Row>
          <Col md={12}>
            <TextInput name="name" label="Name" data={data.name} onChange={handleChange} />
          </Col>
          <Col md={12}>
            <Button type="submit" className="btn-success float-end">
              {mode === "create" ? "Save" : "Update"}
            </Button>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default RoleForm;
