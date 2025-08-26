import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [{ type: "link" as "link", label: "Back", name: "btnBack" }];

export const path = "/groomservices";
export const route = { home: "/groomservices/create" };
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};
export const defaultStateCard = { data: { size: "", weight: "", type: "", price: "", categorytypeid: "" }, meta: {} };
export const modelConfigCard = { read: "/getcard", create: "/newcard", update: "/updatecard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  servicetype: "/getoption/servicecategory",
};
export const listTable = {
  columns: [
    { label: "Category Type", id: "catName" },
    { label: "Size", id: "size" },
    { label: "Weight", id: "weight" },
    { label: "Type", id: "type" },
    { label: "Price (₱)", id: "price" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/groomservice/update", ref: "id" },
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
