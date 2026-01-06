// NAV BUTTONS
import { useValidateByType } from "../../lib/use-validation";

export const navButtons = [{ type: "link" as "link", label: "Back", name: "btnBack", url: "/roleaccesslist" }];

export const path = "/roleaccessdetails";
export const route = { list: "/roleaccesslist" };
export const defaultState = { data: { name: "" }, meta: {} };
export const modelConfig = { read: "/getcard", update: "/updatecard", create: "/newcard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  type: "/getoption/getroleaccesstypes",
  access: "/getoption/getaccessoptions",
  model: "/getoption/getmodels",
};

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "name" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
