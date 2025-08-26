import useModel from "../lib/use-model";
import { listDataReducer } from "./../lib/functions";

const path = "/rolelines";
const apiEndPoints = {
  read: "/index",
  update: "/updatecard",
};
const defaultState = { data: [], meta: {} };

// Types
interface UpdateAction {
  type: "updatefield";
  id: number;
  field: string;
  value: any;
  // updatePayload?: any;
}

interface State {
  data: any[];
  meta: any;
}

// Helper Functions
const updateFieldReducer = (state: State, action: UpdateAction): State => {
  if (!state || !state.data) {
    return { ...defaultState };
  }

  const updatedData = state.data.map((item: any) => {
    if (item.id === action.id) {
      return {
        ...item,
        [action.field]: action.value,
      };
    }
    return item;
  });

  return { ...state, data: updatedData };
};

// Main Reducer
const modelReducer = (state: State, action: any): State => {
  switch (action.type) {
    case "updatefield":
      return updateFieldReducer(state, action);
    case "update":
      return { ...state, data: action.data || state.data };
    default:
      return listDataReducer(state, action);
  }
};

// Hook
const useGlobalRecordAccessModel = () => {
  const [dataState, dataMethods, dataStatus] = useModel(path, defaultState, apiEndPoints, modelReducer);

  return { dataState, ...dataMethods, dataStatus };
};

export default useGlobalRecordAccessModel;
