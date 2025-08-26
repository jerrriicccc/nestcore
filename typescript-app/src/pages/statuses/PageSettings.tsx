import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [{ type: "link" as "link", label: "Back", name: "btnBack" }];

export const path = "/statuses";
export const route = { home: "/statuses/create" };
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};
export const defaultStateCard = { data: { status: "" }, meta: {} };
export const modelConfigCard = { read: "/getcard", create: "/newcard", update: "/updatecard" };

export const listTable = {
  columns: [
    { label: "Status", id: "status" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/statuses/update", ref: "id" },
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
