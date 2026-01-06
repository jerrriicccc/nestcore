import { Button, Form, Row, Col } from "react-bootstrap";
import { SelectInput } from "../../components/form/Input";

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

type OptionType = {
  label: string;
  value: string | number;
};

interface SwitchRoleFormProps {
  data: { defaultroleid?: number };
  selectOptions?: { myRole?: OptionType[] };
  onChange: (input: InputType) => void;
  onSubmit: () => void;
}

const SwitchRoleForm = ({ data, selectOptions = {}, onChange, onSubmit }: SwitchRoleFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Col md={4} className="mx-auto">
      <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 p-2">
        <div className="p-3">
          <Row>
            <Col md={12}>
              <SelectInput name="defaultroleid" label="Switch to Role" data={data?.defaultroleid} options={selectOptions.myRole || []} onChange={onChange} />
            </Col>
            <Col md={12}>
              <Button type="submit" className="btn-primary float-end">
                Submit
              </Button>
            </Col>
          </Row>
        </div>
      </Form>
    </Col>
  );
};

export default SwitchRoleForm;
