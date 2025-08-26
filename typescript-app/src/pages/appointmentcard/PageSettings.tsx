// NAV BUTTONS
import { useValidateByType } from "../../lib/use-validation";

export const navButtons = [{ type: "link" as "link", label: "Back", name: "btnBack", url: "/appointments" }];

export const path = "/appointments";
export const route = { list: "/appointments" };
export const defaultState = { data: { petname: "", servicecategoryid: "", typeid: "", sizeid: "", appointmentdate: "", timeid: "", additionalserviceid: "", durationid: "", price: "" }, meta: {} };
export const modelConfig = { read: "/getcard", update: "/updatecard", create: "/newcard" };

export const optionState = { data: [], meta: {} };
export const optionEndPoints = {
  timeschedule: "/getoption/timeschedules",
  servicecategory: "/getoption/servicecategory",
  size: "/getoption/size",
  type: "/getoption/type",
  // price: "/getoption/price",
};

interface useLocalValidationProps {
  data: Record<string, any>;
}

export const useLocalValidation = (props: useLocalValidationProps) => {
  const fields = [{ name: "" }];

  return useValidateByType({ data: props.data, fields, type: "empty" });
};
