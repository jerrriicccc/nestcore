// NAV BUTTONS
import { useValidateByType } from "../../lib/use-validation";

export const navButtons = [{ type: "link" as "link", label: "Back", name: "btnBack", url: "/roleslist" }];

export const path = "/roles";
export const route = { list: "/roleslist" };
export const defaultState = { data: { name: "" }, meta: {} };
export const modelConfig = { read: "/getcard", update: "/updatecard", create: "/newcard" };

export const globalRecordTable = {
  columns: [
    { label: "Model", id: "accesskey" },
    { label: "Value", id: "accessvalueinput", render: (row: any) => row.accessvalueinput },
    { label: "Grant Type", id: "grantypeidinput", render: (row: any) => row.grantypeidinput },
    { id: "id", hidden: true },
  ],
  buttons: [{ name: "update", type: "save", label: "Save", variant: "success" }],
};

export const moduleTable = {
  columns: [
    { label: "Module", id: "accesskey" },
    { label: "Value", id: "accessvalueinput", render: (row: any) => row.accessvalueinput },
    { id: "id", hidden: true },
  ],
  buttons: [{ name: "btnGetModuleModel", type: "button", label: "Models", variant: "primary" }],
};

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "name" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
