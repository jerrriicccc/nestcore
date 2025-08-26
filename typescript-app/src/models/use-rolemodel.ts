import useModel from "../lib/use-model";
import { useHttpRequest } from "../lib/use-model";
import { readData } from "../lib/crud";

const path = "/roles";
const apiEndPoints = { read: "/getoptionbyquerystring", getAccessOptions: "/getallaccessoptions" };
const defaultState = { data: {}, meta: {} };

const entityReducer = (state: any, action: any) => {
  if (action.type === "read") {
    const model = action.request?.model?.toLowerCase();

    if (model && action.response?.data) {
      const newData = {
        ...state.data,
        [model]: Array.isArray(action.response.data) ? action.response.data : [],
      };
      return { ...state, data: newData };
    }
  } else if (action.type === "/getallaccessoptions") {
    return { ...state, data: action.response.data };
  }

  return state;
};

const useRoleModel = () => {
  const [dataState, dataMethods, dataStatus] = useModel(path, defaultState, apiEndPoints, entityReducer);

  const getOption = useHttpRequest(path, apiEndPoints.read, dataMethods.dataDispatch, dataMethods.statusDispatch, readData);

  return [dataState, { ...dataMethods, getOption }, dataStatus];
};

export default useRoleModel;
