export const simpleDataReducer = (state: any, action: any) => {
  // console.log("simpleDataReducer - Action:", action);
  if (action.type === "read") {
    return action.response;
  } else {
    return state;
  }
};

export const cardDataReducer = (state: any, action: any) => {
  // console.log("cardDataReducer - Action:", action);
  if (action.type === "updateField") {
    const newData = { ...state.data, [action.response.name]: action.response.value };
    return { ...state, data: newData };
  } else if (action.type === "reset") {
    return { ...state, data: action.response };
  } else if (action.type === "updateFields") {
    return { ...state, data: { ...state.data, ...action.response } };
  } else {
    return simpleDataReducer(state, action);
  }
};

export const listDataReducer = (state: any, action: any) => {
  if (action.type === "deleteByIndex") {
    let newData = [...state.data];
    newData.splice(action.index, 1);
    return { ...state, data: newData };
  } else {
    return simpleDataReducer(state, action);
  }
};
