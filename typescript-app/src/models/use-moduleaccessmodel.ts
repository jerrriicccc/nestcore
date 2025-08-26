// import { listDataReducer } from "@/lib/functions";
// import useModel from "@/lib/use-model";

// const path = "/rolelines";
// const apiEndPoints = { read: "/index", update: "/updatecard" };
// const defaultState = { data: [], meta: {} };

// export const modelReducer = (state: any, action: any) => {
//   if (action.type === "updatefield") {
//     let copy = state.data;
//     copy[action.index][action.field] = action.value;
//     return { ...state, data: copy };
//   } else {
//     return listDataReducer(state, action);
//   }
// };

// export const useModuleAccessModel = () => {
//   const [dataState, dataMethods, dataStatus] = useModel(path, defaultState, apiEndPoints, modelReducer);

//   return { dataState, ...dataMethods, dataStatus };
// };

// export default useModuleAccessModel;

import useModel from "../lib/use-model";
import { listDataReducer } from "./../lib/functions";

// Constants
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
    return { ...defaultState }; // Return default state if current state is invalid
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
const useModuleAccessModel = () => {
  const [dataState, dataMethods, dataStatus] = useModel(path, defaultState, apiEndPoints, modelReducer);

  return { dataState, ...dataMethods, dataStatus };
};

export default useModuleAccessModel;
