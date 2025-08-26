import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [
  { type: "link" as "link", label: "Back", name: "btnBack" },
  { type: "link" as "link", label: "Create Status", name: "btnCreate", url: "/statuses/create" },
];

export const path = "/";
export const route = { home: "/timeschedules/create" };
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};
export const defaultStateCard = { data: { timeschedule: "" }, meta: {} };
export const modelConfigCard = { read: "/getcard", create: "/newcard", update: "/updatecard" };

export const listTable = {
  columns: [
    { label: "Status", id: "Status" },
    { label: "Order Number", id: "Order Number" },
    { label: "Linked Status", id: "Linked Status" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/timeschedule/update", ref: "id" },
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
