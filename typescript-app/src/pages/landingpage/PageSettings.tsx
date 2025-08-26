import { useValidateByType } from "../../lib/use-validation";

export const navButtons: any[] = [];

export const path = "/groomservices";
export const defaultState = { data: [], meta: {} };
export const modelConfig = {
  read: "/index",
};
export const path2 = "/daycareservices";
export const defaultState2 = { data: [], meta: {} };
export const modelConfig2 = {
  read: "/index",
};

export const path3 = "/additionalservices";
export const defaultState3 = { data: [], meta: {} };
export const modelConfig3 = {
  read: "/index",
};
interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
