import { Button, Form, Row, Col } from "react-bootstrap";
import { MultiSelectInput, SelectInput, TextInput } from "../../components/form/Input";
import { useParams } from "react-router-dom";

export interface UserData {
  id?: number;
  email: string;
  assignedroles: string[];
  defaultroleid: any;
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface UserFormProps {
  data: UserData;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
  selectOptions?: {
    roles: any;
  };
}

const UserForm = ({ data = { email: "", assignedroles: [], defaultroleid: "" }, onChange, onSubmit, selectOptions }: UserFormProps) => {
  const { mode } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleChange = (e: InputType) => {
    onChange(e);
  };

  return (
    <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 mx-4">
      <div className="p-4">
        <Row>
          <Col md={4}>
            <TextInput name="email" label="Email" data={data.email || ""} onChange={onChange} />
          </Col>
          <Col md={4}>
            <MultiSelectInput name="assignedroles" label="Role" data={data} onChange={(e: InputType) => onChange(e)} selectProps={{ isMulti: true, placeholder: "" }} options={selectOptions?.roles} />
          </Col>
          <Col md={4}>
            <SelectInput name="defaultroleid" label="Default Role" data={data.defaultroleid} onChange={handleChange} options={selectOptions?.roles} />
          </Col>
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

export default UserForm;
