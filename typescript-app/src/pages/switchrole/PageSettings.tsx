// NAV BUTTONS
import { useValidateByType } from "../../lib/use-validation";

export const navButtons = [];

export const path = "/accounts";
export const route = { authorization: "/authorization" };
export const defaultState = { data: { id: 0, assignedroles: [], defaultroleid: 0 }, meta: {} };
export const modelConfig = { read: "/getcard", update: "/updatecard" };
export const optionState = { data: [], meta: {} };
export const optionEndPoints = { myroles: "/getoption/getmyroles" };

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
