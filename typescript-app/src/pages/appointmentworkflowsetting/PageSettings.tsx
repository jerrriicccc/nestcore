import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [
  // { type: "link" as "link", label: "Back", name: "btnBack" },
  { type: "link" as "link", label: "Create Status", name: "btnCreate", url: "/appointmentstatus/create" },
];

export const path = "/appointmentworkflowsettings";
export const route = { home: "/appointmentworkflowsettings/create" };
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};
export const defaultStateCard = { data: { ordernumber: "", linkedfunction: "" }, meta: {} };
export const modelConfigCard = { read: "/getcard", create: "/newcard", update: "/updatecard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  appointmentstat: "/getoption/appointmentstatus",
};

export const listTable = {
  columns: [
    { label: "Status", id: "statusName" },
    { label: "Order Number", id: "ordernumber" },
    { label: "Linked Status", id: "LSNames" },
    { label: "Linked Function", id: "linkedfunction" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/appointmentworkflowsetting/update", ref: "id" },
    },
    {
      name: "delete",
      type: "button" as "button",
      label: "Delete",
      variant: "danger",
    },
  ],
};

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
