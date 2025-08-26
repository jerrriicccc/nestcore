import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [{ type: "link" as "link", label: "Back", name: "btnBack" }];

export const path = "/daycareservices";
export const route = { home: "/daycareservices/create" };
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
  delete: "/deletecard",
};
export const defaultStateCard = { data: { size: "", threehrs: "", sixhrs: "", ninehrs: "", categorytypeid: "" }, meta: {} };
export const modelConfigCard = { read: "/getcard", create: "/newcard", update: "/updatecard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  cattype: "/getoption/servicecategory",
};

export const listTable = {
  columns: [
    { label: "Service ", id: "catName" },
    { label: "Size", id: "size" },
    { label: "3 hrs", id: "threehrs" },
    { label: "6 hrs", id: "sixhrs" },
    { label: "9 hrs", id: "ninehrs" },
    { id: "id", hidden: true },
  ],
  buttons: [
    {
      name: "update",
      type: "link" as "link",
      label: "Update",
      url: { path: "/daycareservice/update", ref: "id" },
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
