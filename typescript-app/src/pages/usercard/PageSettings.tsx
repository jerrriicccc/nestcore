// NAV BUTTONS

import { useValidateByType } from "../../lib/use-validation";

export const navButtons = [{ type: "link" as "link", label: "Back", name: "lnkBack", url: "/userlist" }];

export const path = "/users";
export const route = { list: "/userlist" };
export const defaultState = { data: {}, meta: {} };
export const modelConfig = { read: "/getcard", update: "/updatecard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  roles: "/getoption/roles",
};

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "email" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
