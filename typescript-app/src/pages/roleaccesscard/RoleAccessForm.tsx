// import { Button, Form, Row, Col } from "react-bootstrap";
// import { MultiSelectInput, SelectInput, TextInput } from "../../components/form/Input";
// import { useState } from "react";
// import { useParams } from "react-router-dom";

// export interface RoleAccessData {
//   id?: number;
//   name: string;
//   typeid: string;
//   accesskey: string;
//   access: string[];
//   models: string[];
// }

// type InputType = {
//   name: string;
//   value: string | number | (string | number)[];
//   inputType: "select-single" | "select-multi";
// };

// interface RoleAccessFormProps {
//   data: RoleAccessData;
//   onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
//   onSubmit: () => void;
//   selectOptions: {
//     type: any;
//     access: any;
//     // model: any;
//   };
// }

// const fieldLabels = {
//   name: "Name",
//   typeid: "Type",
//   accesskey: "Access Key",
// };

// const RoleAccessForm = ({ data = { name: "", typeid: "", accesskey: "", access: [], models: [] }, onChange, onSubmit, selectOptions }: RoleAccessFormProps) => {
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const { mode } = useParams();

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};
//     const fields = Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>;

//     fields.forEach((field) => {
//       if (!data[field]) {
//         newErrors[field] = `${fieldLabels[field]} Required`;
//       }
//     });

//     return newErrors;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const errors = validateForm();
//     if (Object.keys(errors).length > 0) {
//       setErrors(errors);
//       return;
//     }

//     onSubmit();
//   };

//   return (
//     <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 p-2 ms-4">
//       <div className="p-3">
//         <Row>
//           <Col md={4}>
//             <SelectInput name="typeid" label="Type" data={data.typeid} onChange={onChange} error={errors.typeid} options={selectOptions.type} />
//           </Col>
//           <Col md={4}>
//             <TextInput name="accesskey" label="Access Key" data={data.accesskey} onChange={onChange} error={errors.accesskey} />
//           </Col>
//           <Col md={4}>
//             <TextInput name="name" label="Name" data={data.name} onChange={onChange} error={errors.name} />
//           </Col>
//         </Row>
//         <Row>
//           <Col md={4}>
//             <MultiSelectInput
//               name="access"
//               label="Access"
//               data={{
//                 ...data,
//                 access: Array.isArray(data.access)
//                   ? data.access.map((label) => {
//                       const option = selectOptions.access.find((opt: any) => opt.label === label);
//                       return option ? option.value : label;
//                     })
//                   : [],
//               }}
//               onChange={(e: InputType) => {
//                 // Convert values to labels before passing up
//                 if (Array.isArray(e.value)) {
//                   const labelValues = (e.value as string[]).map((val) => selectOptions.access.find((opt: any) => opt.value === val)?.label || val);
//                   onChange({ ...e, value: labelValues });
//                 } else {
//                   onChange(e);
//                 }
//               }}
//               error={errors.access}
//               options={selectOptions.access}
//               selectProps={{ isMulti: true }}
//             />
//           </Col>
//           <Col md={4}>
//             <MultiSelectInput name="models" label="Models" data={data} onChange={(e: InputType) => onChange(e)} error={errors.models} options={selectOptions.type} selectProps={{ isMulti: true }} />
//           </Col>
//         </Row>
//         <Row>
//           <Col md={2} className="mx-auto d-flex justify-content-center">
//             <Button type="submit" className="btn-success w-100">
//               {mode === "create" ? "Save" : "Update"}
//             </Button>
//           </Col>
//         </Row>
//       </div>
//     </Form>
//   );
// };

// export default RoleAccessForm;

import { Button, Form, Row, Col } from "react-bootstrap";
import { MultiSelectInput, SelectInput, TextInput } from "../../components/form/Input";
import { useState } from "react";
import { useParams } from "react-router-dom";

export interface RoleAccessData {
  id?: number;
  name: string;
  typeid: string;
  accesskey: string;
  access: string[];
  models: string[];
}

type InputType = {
  name: string;
  value: string | number | (string | number)[];
  inputType: "select-single" | "select-multi";
};

interface RoleAccessFormProps {
  data: RoleAccessData;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | InputType) => void;
  onSubmit: () => void;
  selectOptions: {
    type: any;
    access: any;
    model: any;
  };
}

const fieldLabels = {
  name: "Name",
  typeid: "Type",
  accesskey: "Access Key",
};

// Helper functions for label/value conversion
const convertLabelsToValues = (labels: string[], options: any[]) => {
  return labels.map((label) => {
    const option = options.find((opt) => opt.label === label);
    return option ? option.value : label;
  });
};

const convertValuesToLabels = (values: string[], options: any[]) => {
  return values.map((val) => {
    const option = options.find((opt) => opt.value === val);
    return option ? option.label : val;
  });
};

const RoleAccessForm = ({ data = { name: "", typeid: "", accesskey: "", access: [], models: [] }, onChange, onSubmit, selectOptions }: RoleAccessFormProps) => {
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

  const handleAccessChange = (e: InputType) => {
    if (Array.isArray(e.value)) {
      const labelValues = convertValuesToLabels(e.value as string[], selectOptions.access);
      onChange({ ...e, value: labelValues });
    } else {
      onChange(e);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="card shadow-sm mb-2 p-2 ms-4">
      <div className="p-3">
        <Row>
          <Col md={4}>
            <SelectInput name="typeid" label="Type" data={data.typeid} onChange={onChange} error={errors.typeid} options={selectOptions.type} />
          </Col>
          <Col md={4}>
            <TextInput name="accesskey" label="Access Key" data={data.accesskey} onChange={onChange} error={errors.accesskey} />
          </Col>
          <Col md={4}>
            <TextInput name="name" label="Name" data={data.name} onChange={onChange} error={errors.name} />
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <MultiSelectInput
              name="access"
              label="Access"
              data={{
                ...data,
                access: Array.isArray(data.access) ? convertLabelsToValues(data.access, selectOptions.access) : [],
              }}
              onChange={handleAccessChange}
              error={errors.access}
              options={selectOptions.access}
              selectProps={{ isMulti: true }}
            />
          </Col>
          <Col md={4}>
            <MultiSelectInput name="models" label="Models" data={data} onChange={onChange} error={errors.models} options={selectOptions.model} selectProps={{ isMulti: true }} />
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

export default RoleAccessForm;
