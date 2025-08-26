import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [{ type: "link" as "link", label: "Back", name: "btnBack" }];

export const path = "/additionalservices";
export const route = { home: "/additionalservices/create" };
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};
export const defaultStateCard = { data: { additionalservice: "", price: "" }, meta: {} };
export const modelConfigCard = { read: "/getcard", create: "/newcard", update: "/updatecard" };

export const listTable = {
  columns: [
    { label: "New Service", id: "additionalservice" },
    { label: "Price", id: "price" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/additionalservice/update", ref: "id" },
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
