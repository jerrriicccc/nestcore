// NAV BUTTONS
import { useValidateByType } from "../../lib/use-validation";

export const navButtons = [{ type: "link" as "link", label: "Back", name: "btnBack", url: "/customerlist" }];

export const path = "/customers";
export const route = { list: "/customerlist" };
export const defaultState = { data: { firstname: "", lastname: "" }, meta: {} };
export const modelConfig = { read: "/getcard", update: "/updatecard", create: "/newcard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  status: "/getoption/verifystatuses",
};

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "firstname" }, { name: "lastname" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
